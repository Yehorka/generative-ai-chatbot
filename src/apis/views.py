from rest_framework.permissions import IsAdminUser
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import APIKey
from .serializers import APIKeySerializer


class APIKeyViewSet(ModelViewSet):
    model = APIKey
    serializer_class = APIKeySerializer
    permission_classes = [IsAdminUser]
    queryset = APIKey.objects.all()

@api_view(['GET'])
def check_admin(request):
    if request.user.is_authenticated and request.user.is_staff:

        return Response({'is_admin': True})
    return Response({'is_admin': False})
