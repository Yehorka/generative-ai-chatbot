from httpx import delete
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import Http404
from django.core.validators import ValidationError
from django.contrib.auth.models import User

from .models import Chat, Message
from .serializers import ChatSerilizer, MessageSerializer
from .services import get_ai_response


def get_chat(chat_id: str, user: User) -> Chat:
    try:
        chat = Chat.objects.filter(user=user, pk=chat_id).first()
        if not chat:
            raise Http404
        return chat
    except ValidationError:
        raise Http404


class ChatView(APIView):
    def get(self, request, chat_id=None):
        if chat_id:
            chat = get_chat(chat_id, request.user)
            messages = Message.objects.filter(chat=chat).order_by('timestamp')
            serializer = MessageSerializer(messages, many=True)
            return Response(serializer.data)

        chats = Chat.objects.filter(user=request.user)
        serializer = ChatSerilizer(chats, many=True)
        return Response(serializer.data)

    def post(self, request, chat_id=None):
        if chat_id:
            chat = get_chat(chat_id, request.user)
        else:
            chat = Chat(user=request.user)
            chat.save()

        message = request.data.get('message')

        if not message:
            return Response({"error": "no message"}, status=status.HTTP_400_BAD_REQUEST)

        ai_message = get_ai_response(chat, message)

        return Response({"chat_id": chat.id, "message": ai_message.content})

    def delete(self, request, chat_id):
        chat = get_chat(chat_id, request.user)
        chat.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
