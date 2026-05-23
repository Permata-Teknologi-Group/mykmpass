from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from django.http import JsonResponse

from OAuthService.models import Users, OauthClient, OauthToken
from OAuthService.serializer import UsersSerializer, OauthClientSerializer, OauthTokenSerializer

# Create your views here.

@csrf_exempt
def register(request):
    if request.method == 'POST':
        data = JSONParser().parse(request)
        serializer = UsersSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data, status=201)
        return JsonResponse(serializer.errors, status=400)
    
@csrf_exempt
def token(request):
    if request.method == 'POST':
        data = JSONParser().parse(request)
        # Implement token generation logic here
        return JsonResponse({'message': 'Token generated successfully'}, status=200)
    
@csrf_exempt
def userinfo(request):
    if request.method == 'GET':
        # Implement user info retrieval logic here
        return JsonResponse({'message': 'User info retrieved successfully'}, status=200)