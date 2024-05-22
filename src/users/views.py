from rest_framework.generics import CreateAPIView
from rest_framework.views import APIView, Response
from django.contrib.auth import get_user_model
from rest_framework import permissions

from .serializers import UserSerializer

User = get_user_model()


class UserCreateView(CreateAPIView):
    model = User
    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer


class UserRetriveView(APIView):
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
