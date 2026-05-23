from django.db import models

# Create your models here.
class Users(models.Model):
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=255, unique=True)
    password = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    regcode = models.CharField(max_length=255, unique=True)
    activated = models.BooleanField(default=False)
    phonenumber = models.CharField(max_length=50, blank=True, null=True)
    profilepicture = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
class OauthClient(models.Model):
    id = models.AutoField(primary_key=True)
    client_id = models.CharField(max_length=255, unique=True)
    client_secret = models.CharField(max_length=255)
    redirect_uri = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class OauthToken(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(Users, on_delete=models.CASCADE)
    client = models.ForeignKey(OauthClient, on_delete=models.CASCADE)
    access_token = models.CharField(max_length=255, unique=True)
    refresh_token = models.CharField(max_length=255, unique=True)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)