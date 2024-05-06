from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import Http404
from django.core.validators import ValidationError
from django.contrib.auth import get_user_model

from .models import Chat 
from .serializers import ChatListSerilizer, ChatSerilizer
from .services import get_ai_response

User = get_user_model()


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
            serializer = ChatSerilizer(chat)
            return Response(serializer.data)

        chats = Chat.objects.filter(user=request.user)
        serializer = ChatListSerilizer(chats, many=True)
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

    def put(self, request, chat_id):
        chat = get_chat(chat_id, request.user)
        serializer = ChatSerilizer(chat, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, chat_id):
        chat = get_chat(chat_id, request.user)
        chat.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
