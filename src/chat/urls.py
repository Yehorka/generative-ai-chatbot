from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns

from . import views

urlpatterns = [
    path('', views.ChatView.as_view()),
    path('<str:chat_id>/', views.ChatView.as_view()),
]

urlpatterns = format_suffix_patterns(urlpatterns)
