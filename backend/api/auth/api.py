from ninja import NinjaAPI, Schema
from ninja.errors import HttpError
from auth.models import User, OAuthClient, OAuthToken, OAuthAuthorizationCode
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from datetime import timedelta
from typing import Optional
from django.db.models import Q
import secrets
import uuid

api = NinjaAPI(
    title="OAuth API",
    description="API for handling OAuth authentication and authorization.",
    version="1.0.0",
    docs_url="/docs",
    openapi_url="/openapi.json",
)

# ─────────────────────────────────────────
# Schemas
# ─────────────────────────────────────────

class UserSchema(Schema):
    id: str
    email: str
    username: str
    phone_number: str
    profile_picture: Optional[str] = None
    created_at: str
    updated_at: str

class ClientSchema(Schema):
    id: str
    name: str
    scopes: list
    client_id: str
    redirect_uris: list
    is_active: bool
    created_at: str
    updated_at: str

class TokenSchema(Schema):
    id: str
    user_id: str
    client_id: str
    access_token: str
    refresh_token: str
    scopes: list
    revoked: bool
    expires_at: str
    created_at: str

class TokenRequestSchema(Schema):
    grant_type: str
    client_id: str
    client_secret: str
    code: Optional[str] = None
    redirect_uri: Optional[str] = None
    refresh_token: Optional[str] = None

class CreateClientSchema(Schema):
    name: str
    scopes: list[str]
    redirect_uris: list[str]

# ─────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────

def fmt_dt(dt) -> str:
    return dt.isoformat() if dt else ""

def serialize_user(user) -> dict:
    return {
        "id": str(user.id),
        "username": user.username,
        "email": user.email,
        "phone_number": user.phone_number,
        "profile_picture": user.profile_picture or "",
        "created_at": fmt_dt(user.created_at),
        "updated_at": fmt_dt(user.updated_at),
    }

def serialize_token(token: OAuthToken) -> dict:
    return {
        "id": str(token.id),
        "user_id": str(token.user_id),
        "client_id": str(token.client_id),
        "access_token": token.access_token,
        "refresh_token": token.refresh_token,
        "scopes": token.scopes,
        "revoked": token.revoked,
        "expires_at": fmt_dt(token.expires_at),
        "created_at": fmt_dt(token.created_at),
    }

def generate_token() -> str:
    return secrets.token_urlsafe(48)

def create_oauth_token(user: User, client: OAuthClient) -> OAuthToken:
    """Buat OAuthToken baru (access + refresh sekaligus)."""
    now = timezone.now()
    return OAuthToken.objects.create(
        user=user,
        client=client,
        access_token=generate_token(),
        refresh_token=generate_token(),
        scopes=client.scopes,
        revoked=False,
        expires_at=now + timedelta(hours=1),
    )

def get_active_client(client_id: str, client_secret: str) -> OAuthClient:
    """Validasi client_id + client_secret, raise HttpError jika gagal."""
    try:
        client = OAuthClient.objects.get(client_id=client_id, is_active=True)
    except OAuthClient.DoesNotExist:
        raise HttpError(401, "Client tidak ditemukan atau tidak aktif.")

    if client.client_secret != client_secret:
        raise HttpError(401, "Client secret tidak valid.")

    return client

# ─────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────

@api.post("/register", response={201: UserSchema})
def register(request, email: str, password: str, phone_number: str, username: str):
    if User.objects.filter(username=username).exists():
        raise HttpError(400, "Username sudah dipakai.")

    if User.objects.filter(email=email).exists():
        raise HttpError(400, "Email sudah terdaftar.")

    if User.objects.filter(phone_number=phone_number).exists():
        raise HttpError(400, "Nomor HP sudah terdaftar.")

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        phone_number=phone_number,
    )

    return 201, serialize_user(user)


@api.post("/login", response={200: UserSchema})
def login(request, username: str, password: str):
    """Login dengan username & password."""
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        raise HttpError(401, "Username atau password salah.")

    if not check_password(password, user.password):
        raise HttpError(401, "Username atau password salah.")

    return serialize_user(user)


@api.post("/token", response={200: TokenSchema})
def token(request, data: TokenRequestSchema):
    """
    Generate access token.
    Support grant_type:
    - authorization_code → tukar code dengan token
    - refresh_token      → rotate token lama
    """
    client = get_active_client(data.client_id, data.client_secret)

    # ── Grant: authorization_code ──
    if data.grant_type == "authorization_code":
        if not data.code:
            raise HttpError(400, "Field 'code' diperlukan untuk grant ini.")

        try:
            auth_code = OAuthAuthorizationCode.objects.select_related("user").get(
                code=data.code,
                client=client,
            )
        except OAuthAuthorizationCode.DoesNotExist:
            raise HttpError(401, "Authorization code tidak valid.")

        if auth_code.expires_at < timezone.now():
            auth_code.delete()  # Hapus code expired
            raise HttpError(401, "Authorization code sudah expired.")

        # Tukar code → token, lalu hapus code (single-use)
        new_token = create_oauth_token(auth_code.user, client)
        auth_code.delete()

        return serialize_token(new_token)

    # ── Grant: refresh_token ──
    elif data.grant_type == "refresh_token":
        if not data.refresh_token:
            raise HttpError(400, "Field 'refresh_token' diperlukan untuk grant ini.")

        try:
            old_token = OAuthToken.objects.select_related("user").get(
                refresh_token=data.refresh_token,
                client=client,
                revoked=False,
            )
        except OAuthToken.DoesNotExist:
            raise HttpError(401, "Refresh token tidak valid.")

        if old_token.expires_at < timezone.now():
            raise HttpError(401, "Refresh token sudah expired.")

        # Rotate: revoke lama, buat baru
        old_token.revoked = True
        old_token.save(update_fields=["revoked"])

        new_token = create_oauth_token(old_token.user, client)
        return serialize_token(new_token)

    else:
        raise HttpError(400, f"Grant type '{data.grant_type}' tidak didukung.")


@api.post("/refresh", response={200: TokenSchema})
def refresh(request, refresh_token: str):
    """
    Shortcut refresh tanpa perlu client credentials.
    Cocok untuk mobile/SPA yang sudah simpan refresh_token.
    """
    try:
        old_token = OAuthToken.objects.select_related("user", "client").get(
            refresh_token=refresh_token,
            revoked=False,
        )
    except OAuthToken.DoesNotExist:
        raise HttpError(401, "Refresh token tidak valid.")

    if old_token.expires_at < timezone.now():
        raise HttpError(401, "Refresh token sudah expired.")

    old_token.revoked = True
    old_token.save(update_fields=["revoked"])

    new_token = create_oauth_token(old_token.user, old_token.client)
    return serialize_token(new_token)


@api.post("/revoke", response={200: str})
def revoke(request, token: str):
    """Revoke access token atau refresh token."""
    # Coba cocokkan ke access_token atau refresh_token
    updated = OAuthToken.objects.filter(
        Q(access_token=token) | Q(refresh_token=token),
        revoked=False,
    ).update(revoked=True)

    if not updated:
        raise HttpError(404, "Token tidak ditemukan atau sudah direvoke.")

    return "Token berhasil direvoke."


@api.get("/clients", response={200: list[ClientSchema]})
def list_clients(request):
    """List semua OAuth clients yang aktif."""
    clients = OAuthClient.objects.filter(is_active=True)
    return 200, [
        {
            "id": str(c.id),
            "name": c.name,
            "scopes": c.scopes,
            "client_id": c.client_id,
            "redirect_uris": c.redirect_uris,
            "is_active": c.is_active,
            "created_at": fmt_dt(c.created_at),
            "updated_at": fmt_dt(c.updated_at),
        }
        for c in clients
    ]


@api.post("/clients", response={201: ClientSchema})
def create_client(request, data: CreateClientSchema):
    """Buat OAuth client baru."""
    client = OAuthClient.objects.create(
        name=data.name,
        scopes=data.scopes,
        client_id=secrets.token_urlsafe(16),
        client_secret=secrets.token_urlsafe(32),
        redirect_uris=data.redirect_uris,
        is_active=True,
    )

    return 201, {
        "id": str(client.id),
        "name": client.name,
        "scopes": client.scopes,
        "client_id": client.client_id,
        "redirect_uris": client.redirect_uris,
        "is_active": client.is_active,
        "created_at": fmt_dt(client.created_at),
        "updated_at": fmt_dt(client.updated_at),
    }