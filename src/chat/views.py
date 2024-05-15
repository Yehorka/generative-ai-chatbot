from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework import status
from django.http import Http404
from django.core.validators import ValidationError
from django.contrib.auth import get_user_model

from .models import Chat, Message
from .serializers import ChatListSerializer, ChatSerializer
from .services import get_ai_response
from web_aplication.settings import STUDENT_SEASTEM_MESSAGE, TEACHER_SEASTEM_MESSAGE

User = get_user_model()


def get_chat(chat_id: str, user: User) -> Chat:
    try:
        chat = Chat.objects.filter(user=user, pk=chat_id).first()
        if not chat:
            raise Http404
        return chat
    except ValidationError:
        raise Http404


def create_chat(user: User, name: str, gpt_model: str | None) -> Chat:
    chat = Chat(user=user, name=name)
    if gpt_model:
        chat.gpt_model = gpt_model
    chat.save()
    message_contents = {
        User.UserTypeChoices.STUDENT: STUDENT_SEASTEM_MESSAGE,
        User.UserTypeChoices.TEACHER: TEACHER_SEASTEM_MESSAGE,
    }

    Message(
        chat=chat,
        role=Message.RoleChoices.SYSTEM,
        content=message_contents[user.user_type],
    ).save()
    return chat


class ChatViewSet(ModelViewSet):
    model = Chat
    serializer_class = ChatSerializer

    def get_queryset(self):
        return Chat.objects.filter(user=self.request.user)

    def list(self, request, *args, **kwargs):
        self.serializer_class = ChatListSerializer
        return super().list(request)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        chat = create_chat(
            request.user,
            serializer.validated_data.get("name"),
            serializer.validated_data.get("gpt_model"),
        )
        serializer = self.get_serializer(instance=chat)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CreateMessageView(APIView):
    def post(self, request, chat_id):
        chat = get_chat(chat_id, request.user)
        message = request.data.get("message")

        if not message:
            return Response(
                [{"message": "This field is required"}],
                status=status.HTTP_400_BAD_REQUEST,
            )

        ai_message = get_ai_response(chat, message)
        return Response({"chat_id": chat.id, "message": ai_message.content})
