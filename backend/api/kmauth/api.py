from ninja import NinjaAPI, Schema
from ninja.errors import HttpError
from ninja.security import HttpBearer
from kmauth.models import (
    kmauth_user as User,
    Article, ArticleCategory,
    Announcement,
    Form, FormField, FormResponse, FormResponseAnswer,
)
from django.contrib.auth.hashers import check_password, make_password  # ← tambah make_password
from django.utils import timezone
from django.utils.text import slugify
from typing import Optional
import secrets

KMAPI = NinjaAPI(
    title="KM API",
    description="API for KM Pass.",
    version="1.0.0",
    docs_url="/docs",
    openapi_url="/openapi.json",
)

# ─────────────────────────────────────────
# Simple Token Auth (Bearer)
# ─────────────────────────────────────────

ACTIVE_TOKENS: dict[str, str] = {}

class AuthBearer(HttpBearer):
    def authenticate(self, request, token):
        user_id = ACTIVE_TOKENS.get(token)
        if not user_id:
            return None
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None

auth = AuthBearer()

# ─────────────────────────────────────────
# Schemas — User
# ─────────────────────────────────────────

class UserSchema(Schema):
    id: str
    email: str
    username: str
    phone_number: str
    profile_picture: Optional[str] = None
    created_at: str
    updated_at: str

class LoginSchema(Schema):
    username: str
    password: str

class LoginResponseSchema(Schema):
    token: str
    user: UserSchema

class UpdateProfileSchema(Schema):
    email: Optional[str] = None
    phone_number: Optional[str] = None
    profile_picture: Optional[str] = None

class ChangePasswordSchema(Schema):
    current_password: str
    new_password: str

# ─────────────────────────────────────────
# Schemas — Article
# ─────────────────────────────────────────

class ArticleCategorySchema(Schema):
    id: str
    name: str
    slug: str

class ArticleSchema(Schema):
    id: str
    title: str
    slug: str
    content: str
    excerpt: Optional[str] = None
    thumbnail: Optional[str] = None
    status: str
    category_id: Optional[str] = None
    author_id: Optional[str] = None
    views: int
    published_at: Optional[str] = None
    created_at: str
    updated_at: str

class ArticleIn(Schema):
    title: str
    content: str
    excerpt: Optional[str] = None
    thumbnail: Optional[str] = None
    status: str = "draft"
    category_id: Optional[str] = None

class ArticleCategoryIn(Schema):
    name: str

# ─────────────────────────────────────────
# Schemas — Announcement
# ─────────────────────────────────────────

class AnnouncementSchema(Schema):
    id: str
    title: str
    content: str
    priority: str
    status: str
    author_id: Optional[str] = None
    target_audience: list
    attachment: Optional[str] = None
    starts_at: Optional[str] = None
    expires_at: Optional[str] = None
    created_at: str
    updated_at: str

class AnnouncementIn(Schema):
    title: str
    content: str
    priority: str = "medium"
    status: str = "draft"
    target_audience: list[str] = []
    attachment: Optional[str] = None
    starts_at: Optional[str] = None
    expires_at: Optional[str] = None

# ─────────────────────────────────────────
# Schemas — Form
# ─────────────────────────────────────────

class FormFieldSchema(Schema):
    id: str
    label: str
    field_type: str
    placeholder: Optional[str] = None
    is_required: bool
    options: list
    order: int

class FormFieldIn(Schema):
    label: str
    field_type: str
    placeholder: Optional[str] = None
    is_required: bool = False
    options: list[str] = []
    order: int = 0

class FormSchema(Schema):
    id: str
    title: str
    description: Optional[str] = None
    status: str
    author_id: Optional[str] = None
    is_anonymous: bool
    max_responses: Optional[int] = None
    starts_at: Optional[str] = None
    expires_at: Optional[str] = None
    created_at: str
    updated_at: str
    fields: list[FormFieldSchema] = []

class FormIn(Schema):
    title: str
    description: Optional[str] = None
    status: str = "draft"
    is_anonymous: bool = False
    max_responses: Optional[int] = None
    starts_at: Optional[str] = None
    expires_at: Optional[str] = None
    fields: list[FormFieldIn] = []

class FormAnswerIn(Schema):
    field_id: str
    value: str

class FormResponseIn(Schema):
    answers: list[FormAnswerIn]

class FormResponseSchema(Schema):
    id: str
    form_id: str
    respondent_id: Optional[str] = None
    submitted_at: str
    answers: list[dict] = []

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

def serialize_article(a) -> dict:
    return {
        "id": str(a.id),
        "title": a.title,
        "slug": a.slug,
        "content": a.content,
        "excerpt": a.excerpt,
        "thumbnail": a.thumbnail,
        "status": a.status,
        "category_id": str(a.category_id) if a.category_id else None,
        "author_id": str(a.author_id) if a.author_id else None,
        "views": a.views,
        "published_at": fmt_dt(a.published_at),
        "created_at": fmt_dt(a.created_at),
        "updated_at": fmt_dt(a.updated_at),
    }

def serialize_announcement(a) -> dict:
    return {
        "id": str(a.id),
        "title": a.title,
        "content": a.content,
        "priority": a.priority,
        "status": a.status,
        "author_id": str(a.author_id) if a.author_id else None,
        "target_audience": a.target_audience,
        "attachment": a.attachment,
        "starts_at": fmt_dt(a.starts_at),
        "expires_at": fmt_dt(a.expires_at),
        "created_at": fmt_dt(a.created_at),
        "updated_at": fmt_dt(a.updated_at),
    }

def serialize_form(f) -> dict:
    return {
        "id": str(f.id),
        "title": f.title,
        "description": f.description,
        "status": f.status,
        "author_id": str(f.author_id) if f.author_id else None,
        "is_anonymous": f.is_anonymous,
        "max_responses": f.max_responses,
        "starts_at": fmt_dt(f.starts_at),
        "expires_at": fmt_dt(f.expires_at),
        "created_at": fmt_dt(f.created_at),
        "updated_at": fmt_dt(f.updated_at),
        "fields": [
            {
                "id": str(field.id),
                "label": field.label,
                "field_type": field.field_type,
                "placeholder": field.placeholder,
                "is_required": field.is_required,
                "options": field.options,
                "order": field.order,
            }
            for field in f.fields.all()
        ],
    }

def unique_slug(model, title, current_id=None) -> str:
    slug = slugify(title)
    qs = model.objects.filter(slug=slug)
    if current_id:
        qs = qs.exclude(id=current_id)
    if qs.exists():
        slug = f"{slug}-{secrets.token_urlsafe(4)}"
    return slug

# ─────────────────────────────────────────
# Endpoints — Auth
# ─────────────────────────────────────────

@KMAPI.post("/register", response={201: UserSchema})
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


@KMAPI.post("/login", response={200: LoginResponseSchema})
def login(request, data: LoginSchema):
    try:
        user = User.objects.get(username=data.username)
    except User.DoesNotExist:
        raise HttpError(401, "Username atau password salah.")

    if not check_password(data.password, user.password):
        raise HttpError(401, "Username atau password salah.")

    token = secrets.token_urlsafe(48)
    ACTIVE_TOKENS[token] = str(user.id)

    return {"token": token, "user": serialize_user(user)}


@KMAPI.post("/logout", auth=auth, response={200: str})
def logout(request):
    to_delete = [k for k, v in ACTIVE_TOKENS.items() if v == str(request.auth.id)]
    for k in to_delete:
        del ACTIVE_TOKENS[k]
    return "Logout berhasil."


@KMAPI.get("/me", auth=auth, response={200: UserSchema})
def me(request):
    return serialize_user(request.auth)


@KMAPI.patch("/me", auth=auth, response={200: UserSchema})
def update_profile(request, data: UpdateProfileSchema):
    user = request.auth
    if data.email and data.email != user.email:
        if User.objects.filter(email=data.email).exclude(id=user.id).exists():
            raise HttpError(400, "Email sudah dipakai.")
        user.email = data.email
    if data.phone_number and data.phone_number != user.phone_number:
        if User.objects.filter(phone_number=data.phone_number).exclude(id=user.id).exists():
            raise HttpError(400, "Nomor HP sudah dipakai.")
        user.phone_number = data.phone_number
    if data.profile_picture is not None:
        user.profile_picture = data.profile_picture
    user.save()
    return serialize_user(user)


@KMAPI.post("/me/change-password", auth=auth, response={200: str})
def change_password(request, data: ChangePasswordSchema):
    user = request.auth
    if not check_password(data.current_password, user.password):
        raise HttpError(400, "Password saat ini salah.")
    if len(data.new_password) < 8:
        raise HttpError(400, "Password minimal 8 karakter.")
    user.password = make_password(data.new_password)
    user.save(update_fields=["password"])
    return "Password berhasil diubah."

# ─────────────────────────────────────────
# Endpoints — Article Category
# ─────────────────────────────────────────

@KMAPI.get("/articles/categories", response={200: list[ArticleCategorySchema]})
def list_categories(request):
    return 200, [
        {"id": str(c.id), "name": c.name, "slug": c.slug}
        for c in ArticleCategory.objects.all()
    ]

@KMAPI.post("/articles/categories", auth=auth, response={201: ArticleCategorySchema})
def create_category(request, data: ArticleCategoryIn):
    slug = unique_slug(ArticleCategory, data.name)
    cat = ArticleCategory.objects.create(name=data.name, slug=slug)
    return 201, {"id": str(cat.id), "name": cat.name, "slug": cat.slug}

# ─────────────────────────────────────────
# Endpoints — Article
# ─────────────────────────────────────────

@KMAPI.get("/articles", response={200: list[ArticleSchema]})
def list_articles(request):
    return 200, [serialize_article(a) for a in Article.objects.select_related("author", "category").all()]

@KMAPI.get("/articles/{article_id}", response={200: ArticleSchema})
def get_article(request, article_id: str):
    try:
        a = Article.objects.get(id=article_id)
        a.views += 1
        a.save(update_fields=["views"])
        return serialize_article(a)
    except Article.DoesNotExist:
        raise HttpError(404, "Artikel tidak ditemukan.")

@KMAPI.post("/articles", auth=auth, response={201: ArticleSchema})
def create_article(request, data: ArticleIn):
    slug = unique_slug(Article, data.title)
    published_at = timezone.now() if data.status == "published" else None
    a = Article.objects.create(
        title=data.title,
        slug=slug,
        content=data.content,
        excerpt=data.excerpt,
        thumbnail=data.thumbnail,
        status=data.status,
        category_id=data.category_id,
        author=request.auth,
        published_at=published_at,
    )
    return 201, serialize_article(a)

@KMAPI.put("/articles/{article_id}", auth=auth, response={200: ArticleSchema})
def update_article(request, article_id: str, data: ArticleIn):
    try:
        a = Article.objects.get(id=article_id)
    except Article.DoesNotExist:
        raise HttpError(404, "Artikel tidak ditemukan.")

    a.title = data.title
    a.slug = unique_slug(Article, data.title, current_id=article_id)
    a.content = data.content
    a.excerpt = data.excerpt
    a.thumbnail = data.thumbnail
    a.category_id = data.category_id
    if data.status == "published" and a.status != "published":
        a.published_at = timezone.now()
    a.status = data.status
    a.save()
    return serialize_article(a)

@KMAPI.delete("/articles/{article_id}", auth=auth, response={200: str})
def delete_article(request, article_id: str):
    try:
        Article.objects.get(id=article_id).delete()
    except Article.DoesNotExist:
        raise HttpError(404, "Artikel tidak ditemukan.")
    return "Artikel berhasil dihapus."

# ─────────────────────────────────────────
# Endpoints — Announcement
# ─────────────────────────────────────────

@KMAPI.get("/announcements", response={200: list[AnnouncementSchema]})
def list_announcements(request):
    return 200, [serialize_announcement(a) for a in Announcement.objects.all()]

@KMAPI.get("/announcements/{announcement_id}", response={200: AnnouncementSchema})
def get_announcement(request, announcement_id: str):
    try:
        return serialize_announcement(Announcement.objects.get(id=announcement_id))
    except Announcement.DoesNotExist:
        raise HttpError(404, "Pengumuman tidak ditemukan.")

@KMAPI.post("/announcements", auth=auth, response={201: AnnouncementSchema})
def create_announcement(request, data: AnnouncementIn):
    from django.utils.dateparse import parse_datetime
    a = Announcement.objects.create(
        title=data.title,
        content=data.content,
        priority=data.priority,
        status=data.status,
        author=request.auth,
        target_audience=data.target_audience,
        attachment=data.attachment,
        starts_at=parse_datetime(data.starts_at) if data.starts_at else None,
        expires_at=parse_datetime(data.expires_at) if data.expires_at else None,
    )
    return 201, serialize_announcement(a)

@KMAPI.put("/announcements/{announcement_id}", auth=auth, response={200: AnnouncementSchema})
def update_announcement(request, announcement_id: str, data: AnnouncementIn):
    from django.utils.dateparse import parse_datetime
    try:
        a = Announcement.objects.get(id=announcement_id)
    except Announcement.DoesNotExist:
        raise HttpError(404, "Pengumuman tidak ditemukan.")

    a.title = data.title
    a.content = data.content
    a.priority = data.priority
    a.status = data.status
    a.target_audience = data.target_audience
    a.attachment = data.attachment
    a.starts_at = parse_datetime(data.starts_at) if data.starts_at else None
    a.expires_at = parse_datetime(data.expires_at) if data.expires_at else None
    a.save()
    return serialize_announcement(a)

@KMAPI.delete("/announcements/{announcement_id}", auth=auth, response={200: str})
def delete_announcement(request, announcement_id: str):
    try:
        Announcement.objects.get(id=announcement_id).delete()
    except Announcement.DoesNotExist:
        raise HttpError(404, "Pengumuman tidak ditemukan.")
    return "Pengumuman berhasil dihapus."

# ─────────────────────────────────────────
# Endpoints — Form
# ─────────────────────────────────────────

@KMAPI.get("/forms", response={200: list[FormSchema]})
def list_forms(request):
    return 200, [serialize_form(f) for f in Form.objects.prefetch_related("fields").all()]

@KMAPI.get("/forms/{form_id}", response={200: FormSchema})
def get_form(request, form_id: str):
    try:
        return serialize_form(Form.objects.prefetch_related("fields").get(id=form_id))
    except Form.DoesNotExist:
        raise HttpError(404, "Form tidak ditemukan.")

@KMAPI.post("/forms", auth=auth, response={201: FormSchema})
def create_form(request, data: FormIn):
    from django.utils.dateparse import parse_datetime
    f = Form.objects.create(
        title=data.title,
        description=data.description,
        status=data.status,
        author=request.auth,
        is_anonymous=data.is_anonymous,
        max_responses=data.max_responses,
        starts_at=parse_datetime(data.starts_at) if data.starts_at else None,
        expires_at=parse_datetime(data.expires_at) if data.expires_at else None,
    )
    for field in data.fields:
        FormField.objects.create(
            form=f,
            label=field.label,
            field_type=field.field_type,
            placeholder=field.placeholder,
            is_required=field.is_required,
            options=field.options,
            order=field.order,
        )
    return 201, serialize_form(f)

@KMAPI.put("/forms/{form_id}", auth=auth, response={200: FormSchema})
def update_form(request, form_id: str, data: FormIn):
    from django.utils.dateparse import parse_datetime
    try:
        f = Form.objects.get(id=form_id)
    except Form.DoesNotExist:
        raise HttpError(404, "Form tidak ditemukan.")

    f.title = data.title
    f.description = data.description
    f.status = data.status
    f.is_anonymous = data.is_anonymous
    f.max_responses = data.max_responses
    f.starts_at = parse_datetime(data.starts_at) if data.starts_at else None
    f.expires_at = parse_datetime(data.expires_at) if data.expires_at else None
    f.save()

    f.fields.all().delete()
    for field in data.fields:
        FormField.objects.create(
            form=f,
            label=field.label,
            field_type=field.field_type,
            placeholder=field.placeholder,
            is_required=field.is_required,
            options=field.options,
            order=field.order,
        )
    return serialize_form(f)

@KMAPI.delete("/forms/{form_id}", auth=auth, response={200: str})
def delete_form(request, form_id: str):
    try:
        Form.objects.get(id=form_id).delete()
    except Form.DoesNotExist:
        raise HttpError(404, "Form tidak ditemukan.")
    return "Form berhasil dihapus."

# ─────────────────────────────────────────
# Endpoints — Form Response
# ─────────────────────────────────────────

@KMAPI.post("/forms/{form_id}/submit", response={201: FormResponseSchema})
def submit_form(request, form_id: str, data: FormResponseIn):
    try:
        f = Form.objects.prefetch_related("fields").get(id=form_id, status="published")
    except Form.DoesNotExist:
        raise HttpError(404, "Form tidak ditemukan atau belum dipublish.")

    if f.max_responses and f.responses.count() >= f.max_responses:
        raise HttpError(400, "Form sudah mencapai batas maksimal respons.")

    if f.expires_at and f.expires_at < timezone.now():
        raise HttpError(400, "Form sudah ditutup.")

    required_field_ids = set(str(field.id) for field in f.fields.filter(is_required=True))
    answered_field_ids = {a.field_id for a in data.answers}
    if required_field_ids - answered_field_ids:
        raise HttpError(400, "Ada field wajib yang belum diisi.")

    respondent = None
    if not f.is_anonymous and hasattr(request, "auth") and request.auth:
        respondent = request.auth

    response = FormResponse.objects.create(form=f, respondent=respondent)
    answers = []
    for ans in data.answers:
        try:
            field = f.fields.get(id=ans.field_id)
        except FormField.DoesNotExist:
            raise HttpError(400, f"Field {ans.field_id} tidak valid.")
        answer = FormResponseAnswer.objects.create(response=response, field=field, value=ans.value)
        answers.append({"field_id": str(field.id), "label": field.label, "value": answer.value})

    return 201, {
        "id": str(response.id),
        "form_id": str(f.id),
        "respondent_id": str(respondent.id) if respondent else None,
        "submitted_at": fmt_dt(response.submitted_at),
        "answers": answers,
    }

@KMAPI.get("/forms/{form_id}/responses", auth=auth, response={200: list[FormResponseSchema]})
def list_responses(request, form_id: str):
    try:
        f = Form.objects.get(id=form_id)
    except Form.DoesNotExist:
        raise HttpError(404, "Form tidak ditemukan.")

    result = []
    for r in f.responses.prefetch_related("answers__field").all():
        result.append({
            "id": str(r.id),
            "form_id": str(f.id),
            "respondent_id": str(r.respondent_id) if r.respondent_id else None,
            "submitted_at": fmt_dt(r.submitted_at),
            "answers": [
                {"field_id": str(a.field_id), "label": a.field.label, "value": a.value}
                for a in r.answers.all()
            ],
        })
    return 200, result