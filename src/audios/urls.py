from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns

from . import views

urlpatterns = [
    path('text-to-speech/', views.text_to_speech_view, name='text-to-speech'),
    path('speech-to-text/', views.speech_to_text_view, name='speech-to-text'),
]

urlpatterns = format_suffix_patterns(urlpatterns)
