from apis.services import NoAPIKeyException
from django.contrib.auth import get_user_model
from django.core.files.storage import default_storage
from django.core.validators import ValidationError
from django.http import Http404
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from web_aplication.settings import STUDENT_SEASTEM_MESSAGE, TEACHER_SEASTEM_MESSAGE

from .models import Chat, Message
from .serializers import ChatListSerializer, ChatSerializer, MessageSerializer
from .services import get_ai_message, transcribe_audio


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
    platform = (data.get("platform") or Chat.PLATFORM_CHOICES[0][0]).lower()
    default_model = "gemini-2.5-flash-lite" if platform == "gemini" else "gpt-4o-mini"

    chat = Chat(
        user=user,
        name=data["name"],
        gpt_model=data.get("gpt_model", Chat.GPTModelChoices.GPT_4O_MINI),
        platform=platform,
        model_name=data.get("model_name", default_model),
    )
    chat.save()
    message_contents = {
        User.UserTypeChoices.STUDENT: STUDENT_SEASTEM_MESSAGE,
        User.UserTypeChoices.TEACHER: TEACHER_SEASTEM_MESSAGE,
    }

    Message(
        chat=chat,
        role=Message.RoleChoices.SYSTEM,
        content=message_contents.get(user.user_type, STUDENT_SEASTEM_MESSAGE),
    ).save()
    return chat


class ChatViewSet(ModelViewSet):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer

    def get_queryset(self):
        queryset = Chat.objects.filter(user=self.request.user)
        platform = self.request.query_params.get("platform")
        if platform:
            queryset = queryset.filter(platform=platform.lower())
        return queryset

    def get_serializer_class(self):
        if self.action == "list":
            return ChatListSerializer
        return ChatSerializer

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        chat = create_chat(request.user, serializer.validated_data)
        serializer = self.get_serializer(instance=chat)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(
        detail=True,
        methods=["post"],
        url_path="content",
        parser_classes=[MultiPartParser, FormParser, JSONParser],
    )
    def send(self, request, pk=None):
        chat = self.get_object()
        message_raw = request.data.get("message", "")
        message_text = str(message_raw).strip() if message_raw is not None else ""
        image_file = request.FILES.get("image")

        if image_file and chat.platform != "openai":
            return Response(
                {"detail": "Image uploads are only available for OpenAI chats."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if image_file and (not image_file.content_type or not image_file.content_type.startswith("image/")):
            return Response(
                {"image": ["Only image uploads are supported."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not message_text and not image_file:
            return Response(
                {"message": ["This field is required when no image is provided."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            ai_message = get_ai_message(chat, message_text, image_file=image_file)
        except NoAPIKeyException as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except RuntimeError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        serializer = MessageSerializer(ai_message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(
        detail=True,
        methods=["post"],
        url_path="content",
        parser_classes=[MultiPartParser, FormParser, JSONParser],
    )
    def send(self, request, pk=None):
        chat = self.get_object()
        message_raw = request.data.get("message", "")
        message_text = str(message_raw).strip() if message_raw is not None else ""
        image_file = request.FILES.get("image")

        if image_file and chat.platform != "openai":
            return Response(
                {"detail": "Image uploads are only available for OpenAI chats."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if image_file and (not image_file.content_type or not image_file.content_type.startswith("image/")):
            return Response(
                {"image": ["Only image uploads are supported."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not message_text and not image_file:
            return Response(
                {"message": ["This field is required when no image is provided."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            ai_message = get_ai_message(chat, message_text, image_file=image_file)
        except NoAPIKeyException as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except RuntimeError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        serializer = MessageSerializer(ai_message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(
        detail=True,
        methods=["post"],
        url_path="content",
        parser_classes=[MultiPartParser, FormParser, JSONParser],
    )
    def send(self, request, pk=None):
        chat = self.get_object()
        message_raw = request.data.get("message", "")
        message_text = str(message_raw).strip() if message_raw is not None else ""
        image_file = request.FILES.get("image")

        if image_file and chat.platform != "openai":
            return Response(
                {"detail": "Image uploads are only available for OpenAI chats."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if image_file and (not image_file.content_type or not image_file.content_type.startswith("image/")):
            return Response(
                {"image": ["Only image uploads are supported."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not message_text and not image_file:
            return Response(
                {"message": ["This field is required when no image is provided."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            ai_message = get_ai_message(chat, message_text, image_file=image_file)
        except NoAPIKeyException as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except RuntimeError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        serializer = MessageSerializer(ai_message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(
        detail=True,
        methods=["post"],
        url_path="content",
        parser_classes=[MultiPartParser, FormParser, JSONParser],
    )
    def send(self, request, pk=None):
        chat = self.get_object()
        message_raw = request.data.get("message", "")
        message_text = str(message_raw).strip() if message_raw is not None else ""
        image_file = request.FILES.get("image")

        if image_file and chat.platform != "openai":
            return Response(
                {"detail": "Image uploads are only available for OpenAI chats."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if image_file and (not image_file.content_type or not image_file.content_type.startswith("image/")):
            return Response(
                {"image": ["Only image uploads are supported."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not message_text and not image_file:
            return Response(
                {"message": ["This field is required when no image is provided."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            ai_message = get_ai_message(chat, message_text, image_file=image_file)
        except NoAPIKeyException as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except RuntimeError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        serializer = MessageSerializer(ai_message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(
        detail=True,
        methods=["post"],
        url_path="content",
        parser_classes=[MultiPartParser, FormParser, JSONParser],
    )
    def send(self, request, pk=None):
        chat = self.get_object()
        message_raw = request.data.get("message", "")
        message_text = str(message_raw).strip() if message_raw is not None else ""
        image_file = request.FILES.get("image")

        if image_file and chat.platform != "openai":
            return Response(
                {"detail": "Image uploads are only available for OpenAI chats."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if image_file and (not image_file.content_type or not image_file.content_type.startswith("image/")):
            return Response(
                {"image": ["Only image uploads are supported."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not message_text and not image_file:
            return Response(
                {"message": ["This field is required when no image is provided."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            ai_message = get_ai_message(chat, message_text, image_file=image_file)
        except NoAPIKeyException as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except RuntimeError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        serializer = MessageSerializer(ai_message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="content")
    def send(self, request, pk=None):
        chat = self.get_object()
        message_text = request.data.get("message", "")
        if not message_text or not str(message_text).strip():
            return Response(
                {"message": ["This field is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        message_text = str(message_text).strip()

        try:
            ai_message = get_ai_message(chat, message_text)
        except NoAPIKeyException as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except RuntimeError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        serializer = MessageSerializer(ai_message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="content")
    def send(self, request, pk=None):
        chat = self.get_object()
        message_text = request.data.get("message", "")
        if not message_text or not str(message_text).strip():
            return Response(
                {"message": ["This field is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        message_text = str(message_text).strip()

        try:
            ai_message = get_ai_message(chat, message_text)
        except NoAPIKeyException as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except RuntimeError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        serializer = MessageSerializer(ai_message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="content")
    def send(self, request, pk=None):
        chat = self.get_object()
        message_text = request.data.get("message", "")
        if not message_text or not str(message_text).strip():
            return Response(
                {"message": ["This field is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        message_text = str(message_text).strip()

        try:
            ai_message = get_ai_message(chat, message_text)
        except NoAPIKeyException as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except RuntimeError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        serializer = MessageSerializer(ai_message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MessageCreateView(APIView):
    def post(self, request, chat_id):
        message = request.data.get("message", "")
        if not message or not str(message).strip():
            return Response(
                [{"message": "This field is required"}],
                status=status.HTTP_400_BAD_REQUEST,
            )
        message = str(message).strip()

        chat = get_chat(chat_id, request.user)
        try:
            ai_message = get_ai_message(chat, message)
        except NoAPIKeyException as e:
            return Response(
                {"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except RuntimeError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(
            {
                "chat_id": chat.id,
                "message": MessageSerializer(ai_message).data,
            },
            status=status.HTTP_201_CREATED,
        )

class VoiceToTextView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        audio_file = request.FILES['audio']
        file_path = default_storage.save('tmp/recording.wav', audio_file)

        try:
            transcription = transcribe_audio(file_path)
        except NotImplementedError as exc:
            return Response(
                {"detail": str(exc)}, status=status.HTTP_501_NOT_IMPLEMENTED
            )

        return Response({'transcription': transcription})
