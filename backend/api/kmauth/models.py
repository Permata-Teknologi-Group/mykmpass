from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid

# ─────────────────────────────────────────
# User
# ─────────────────────────────────────────

class kmauth_user(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, unique=True)
    username = models.CharField(max_length=50, unique=True)
    profile_picture = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'phone_number']

    class Meta:
        db_table = 'kmauth_user'


# ─────────────────────────────────────────
# Artikel
# ─────────────────────────────────────────

class ArticleCategory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'article_category'

    def __str__(self):
        return self.name


class Article(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PUBLISHED = 'published', 'Published'
        ARCHIVED = 'archived', 'Archived'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    content = models.TextField()
    excerpt = models.TextField(blank=True, null=True)
    thumbnail = models.URLField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    category = models.ForeignKey(ArticleCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='articles')
    author = models.ForeignKey('kmauth_user', on_delete=models.SET_NULL, null=True, related_name='articles')
    views = models.PositiveIntegerField(default=0)
    published_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'article'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


# ─────────────────────────────────────────
# Announcement
# ─────────────────────────────────────────

class Announcement(models.Model):
    class Priority(models.TextChoices):
        LOW = 'low', 'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH = 'high', 'High'
        URGENT = 'urgent', 'Urgent'

    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PUBLISHED = 'published', 'Published'
        EXPIRED = 'expired', 'Expired'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    content = models.TextField()
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.MEDIUM)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    author = models.ForeignKey('kmauth_user', on_delete=models.SET_NULL, null=True, related_name='announcements')
    target_audience = models.JSONField(default=list, blank=True)  # e.g. ['all', 'admin', 'member']
    attachment = models.URLField(blank=True, null=True)
    starts_at = models.DateTimeField(blank=True, null=True)
    expires_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'announcement'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


# ─────────────────────────────────────────
# Form Management
# ─────────────────────────────────────────

class Form(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PUBLISHED = 'published', 'Published'
        CLOSED = 'closed', 'Closed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    author = models.ForeignKey('kmauth_user', on_delete=models.SET_NULL, null=True, related_name='forms')
    is_anonymous = models.BooleanField(default=False)   # boleh submit tanpa login
    max_responses = models.PositiveIntegerField(blank=True, null=True)  # None = unlimited
    starts_at = models.DateTimeField(blank=True, null=True)
    expires_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'form'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class FormField(models.Model):
    class FieldType(models.TextChoices):
        TEXT = 'text', 'Text'
        TEXTAREA = 'textarea', 'Textarea'
        NUMBER = 'number', 'Number'
        EMAIL = 'email', 'Email'
        PHONE = 'phone', 'Phone'
        DATE = 'date', 'Date'
        DROPDOWN = 'dropdown', 'Dropdown'
        CHECKBOX = 'checkbox', 'Checkbox'
        RADIO = 'radio', 'Radio'
        FILE = 'file', 'File Upload'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name='fields')
    label = models.CharField(max_length=255)
    field_type = models.CharField(max_length=20, choices=FieldType.choices)
    placeholder = models.CharField(max_length=255, blank=True, null=True)
    is_required = models.BooleanField(default=False)
    options = models.JSONField(default=list, blank=True)  # untuk dropdown/checkbox/radio
    order = models.PositiveIntegerField(default=0)        # urutan tampil di form
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'form_field'
        ordering = ['order']

    def __str__(self):
        return f"{self.form.title} — {self.label}"


class FormResponse(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name='responses')
    respondent = models.ForeignKey('kmauth_user', on_delete=models.SET_NULL, null=True, blank=True, related_name='form_responses')
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'form_response'
        ordering = ['-submitted_at']

    def __str__(self):
        return f"Response #{self.id} — {self.form.title}"


class FormResponseAnswer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    response = models.ForeignKey(FormResponse, on_delete=models.CASCADE, related_name='answers')
    field = models.ForeignKey(FormField, on_delete=models.CASCADE, related_name='answers')
    value = models.TextField(blank=True, null=True)  # semua jawaban disimpan sebagai text

    class Meta:
        db_table = 'form_response_answer'

    def __str__(self):
        return f"{self.field.label}: {self.value}"