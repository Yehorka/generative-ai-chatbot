from rest_framework import serializers

from .models import Chat, Message


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ("id", "role", "content", "image", "timestamp")
        read_only_fields = fields


class ChatSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Chat
        fields = [
            "id",
            "name",
            "created_at",
            "gpt_model",
            "platform",
            "model_name",
            "messages",
        ]
        read_only_fields = ["id", "created_at", "messages"]
        extra_kwargs = {
            "gpt_model": {"required": False},
            "platform": {"required": False},
            "model_name": {"required": False},
        }


class ChatListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ["id", "name", "created_at", "gpt_model", "platform", "model_name"]
        read_only_fields = ["id", "created_at"]
