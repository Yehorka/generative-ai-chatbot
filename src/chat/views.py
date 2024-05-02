from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Chat, Message
from .serializers import ChatSerilizer, MessageSerializer  
from .services import get_ai_response


class ChatView(APIView):
    def get(self, request, chat_id=None):
        if chat_id:
            chat = Chat.objects.get(pk=chat_id)
            messages = Message.objects.filter(chat=chat).order_by('timestamp')
            serializer = MessageSerializer(messages, many=True)
            return Response(serializer.data)

        chats = Chat.objects.filter(user=request.user)
        serializer = ChatSerilizer(chats, many=True)
        return Response(serializer.data)
        
    def post(self, request, chat_id=None,):
        if chat_id:
            chat = Chat.objects.get(pk=chat_id)
        else:
            chat = Chat(user=request.user)
            chat.save()

        message = request.data.get('message')

        if not message:
            return Response({"error": "no message"}, status=status.HTTP_400_BAD_REQUEST)

        ai_message = get_ai_response(chat, message)

        return Response({"chat_id": chat.id, "message": ai_message.content})
