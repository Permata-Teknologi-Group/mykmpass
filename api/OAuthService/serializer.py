from rest_framework import serializers
from OAuthService.models import Users, OauthClient, OauthToken

class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ['id', 'username', 'email', 'regcode', 'phonenumber']

class OauthClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = OauthClient
        fields = ['id', 'client_id', 'client_secret', 'redirect_uri', 'created_at', 'updated_at']

class OauthTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = OauthToken
        fields = ['id', 'user', 'client', 'access_token', 'refresh_token', 'expires_at', 'created_at', 'updated_at']