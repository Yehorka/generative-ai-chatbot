from typing import Iterable
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Chat, Message
from .serializers import ChatSerilizer, MessageSerializer  


def get_ai_responce(messages: Iterable[Message]) -> str:
    #TODO
    return "TEMPORATY TEXT"

class ChatView(APIView):
    def get(self, request, chat_id=None, format=None):
        if chat_id:
            chat = Chat.objects.get(pk=chat_id)
            messages = Message.objects.filter(chat=chat).order_by('timestamp')
            serializer = MessageSerializer(messages, many=True)
            return Response(serializer.data)

        chats = Chat.objects.filter(user=request.user)
        serializer = ChatSerilizer(chats, many=True)
        return Response(serializer.data)
        
    def post(self, request, chat_id=None, format=None):
        if chat_id:
            chat = Chat.objects.get(pk=chat_id)
        else:
            chat = Chat(user=request.user)
            chat.save()

        content = request.data.get('content')

        if not content:
            return Response({"error": "no content"}, status=status.HTTP_400_BAD_REQUEST)

        message = Message(chat=chat, role=Message.RoleChoices.USER, content=content)
        message.save()
        
        messages = Message.objects.filter(chat=chat).order_by('timestamp')
        
        ai_responce =  get_ai_responce(messages)
        ai_message = Message(
            chat=chat, role=Message.RoleChoices.ASSISTANT, content=ai_responce
        )
        ai_message.save()
        serialiser = MessageSerializer(ai_message)
        return Response(serialiser.data)
