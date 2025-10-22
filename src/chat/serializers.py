# Updated content of src/chat/serializers.py

from rest_framework import serializers
from .models import Chat

class ChatSerializer(serializers.ModelSerializer):
    platform = serializers.CharField(max_length=100, required=False)
    model_name = serializers.CharField(max_length=100, required=False)

    class Meta:
        model = Chat
        fields = ['id', 'message', 'created_at', 'platform', 'model_name']
