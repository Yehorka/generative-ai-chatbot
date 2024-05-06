from rest_framework import serializers
from .models import Chat, Message


class ChatListSerilizer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ['id']


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['role', 'content']
        read_only = ['role']



class ChatSerilizer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Chat
        fields = ['id', 'gpt_model', 'messages']
        read_only_fields = ['id', 'messages']
