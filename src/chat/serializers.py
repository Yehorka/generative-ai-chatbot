from rest_framework import serializers
from .models import Chat, Message


class ChatListSerilizer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ['id', 'name']


class NotSystemMessageSerializer(serializers.ListSerializer):
    def to_representation(self, data):
        data = data.exclude(role=Message.RoleChoices.SYSTEM)
        return super().to_representation(data)


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        list_serializer_class = NotSystemMessageSerializer
        fields = ['role', 'content']
        read_only = ['roel']
        


class ChatSerilizer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Chat
        fields = ['id', 'name', 'gpt_model', 'messages']
        read_only_fields = ['id', 'messages']
