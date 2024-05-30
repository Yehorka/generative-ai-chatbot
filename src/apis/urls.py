from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns

from . import views

api_key_list = views.APIKeyViewSet.as_view({'get': 'list', 'post': 'create'})
api_key_detail = views.APIKeyViewSet.as_view(
    {
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy',
    }
)


urlpatterns = [
    path('keys/', api_key_list, name='api-key-list'),
    path('keys/<int:pk>/', api_key_detail, name='api-key-detail'),
    path('check-admin/', views.check_admin, name='check-admin'),
]

urlpatterns = format_suffix_patterns(urlpatterns)
