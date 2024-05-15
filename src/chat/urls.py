from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns

from . import views

chat_list = views.ChatViewSet.as_view({'get': 'list', 'post': 'create'})
chat_detail = views.ChatViewSet.as_view(
    {
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy',
    }
)
create_message = views.CreateMessageView.as_view()

urlpatterns = [
    path('', chat_list, name='chat-list'),
    path('voice-to-text/', views.VoiceToTextView.as_view(), name='voice-to-text'),
    path('<str:pk>/', chat_detail, name='chat-detail'),
    path('<str:chat_id>/new_message/', create_message, name='create-messagee'),
    
    
]

urlpatterns = format_suffix_patterns(urlpatterns)
