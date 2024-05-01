from rest_framework import serializers
from .models import Chat, Message


class ChatListSerilizer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ['id']


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['chat', 'role', 'content']
        read_only_fields = ['role']

    def create(self, validated_data):
        chat = Chat.objects.get(pk=validated_data["chat"])
        return Message(
            chat=chat,
            roel=Message.RoleChoices.USER,
            content=validated_data["message"],
        )


class NewChatSerialiser(serializers.Serializer):
    user = serializers.UUIDField(required=False)
    message = serializers.CharField(required=True)

    def create(self, validated_data):
        chat = Chat(user=self.validated_data["user"])
        return Message(
            chat=chat,
            roel=Message.RoleChoices.USER,
            content=validated_data["message"],
        )
