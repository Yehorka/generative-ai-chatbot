from rest_framework.generics import CreateAPIView
from rest_framework.views import APIView, Response
from django.contrib.auth.models import User
from rest_framework import permissions

from .serializers import UserSerializer


class CreateUserView(CreateAPIView):
    model = User
    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer
