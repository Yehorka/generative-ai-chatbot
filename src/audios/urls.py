from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns

from . import views

urlpatterns = [
    path('text-to-speach/', views.text_to_speech_view, name='text-to-speech'),
]

urlpatterns = format_suffix_patterns(urlpatterns)
