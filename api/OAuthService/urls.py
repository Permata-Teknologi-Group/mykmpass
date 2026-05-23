from django.urls import re_path
from OAuthService import views

urlpatterns = [
    re_path(r'^register/$', views.register, name='register'),
    re_path(r'^token/$', views.token, name='token'),
    re_path(r'^userinfo/$', views.userinfo, name='userinfo'),
]