from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework import status
from django.http import Http404
from django.core.validators import ValidationError
from django.contrib.auth import get_user_model
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.storage import default_storage
from .models import Chat, Message
from .services import get_ai_message, transcribe_audio
from .serializers import ChatListSerializer, ChatSerializer
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


def create_chat(user: User, data: dict) -> Chat:
    chat = Chat(user=user, **data)
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

    def list(self, request):
        self.serializer_class = ChatListSerializer
        return super().list(request)

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        chat = create_chat(
            request.user,
            serializer.validated_data,
        )
        serializer = self.get_serializer(instance=chat)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MessageCreateView(APIView):
    def post(self, request, chat_id):
        if not (message := request.data.get("message")):
            return Response(
                [{"message": "This field is required"}],
                status=status.HTTP_400_BAD_REQUEST,
            )

        chat = get_chat(chat_id, request.user)

        ai_message = get_ai_message(chat, message)
        return Response({"chat_id": chat.id, "message": ai_message.content})

class VoiceToTextView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        audio_file = request.FILES['audio']
        file_path = default_storage.save('tmp/recording.wav', audio_file)
        
        transcription = transcribe_audio(file_path)
        return Response({'transcription': transcription})
