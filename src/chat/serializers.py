from rest_framework import serializers
from .models import Chat, Message


class ChatSerilizer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ['id']


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['role', 'content']
        read_only = ['role']

