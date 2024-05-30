from rest_framework.permissions import IsAdminUser
from rest_framework.viewsets import ModelViewSet

from .models import APIKey
from .serializers import APIKeySerializer


class APIKeyViewSet(ModelViewSet):
    model = APIKey
    serializer_class = APIKeySerializer
    permission_classes = [IsAdminUser]
    queryset = APIKey.objects.all()
