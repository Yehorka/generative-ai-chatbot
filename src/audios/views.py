from django.conf import settings
from django.http import FileResponse
from rest_framework.decorators import api_view
from django.core.files.storage import default_storage
from rest_framework.views import Response

from .services import text_to_speech, speech_to_text
from .serializers import TextToSpeechSerializer, SpeechToTextSerializer


@api_view(['POST'])
def text_to_speech_view(request):
    serializer = TextToSpeechSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    file_path = (
        settings.MEDIA_ROOT / f"audios/{request.user.id}/text_to_speech/audio.mp3"
    )
    file_path.parent.mkdir(exist_ok=True, parents=True)

    text_to_speech(file_path, serializer.validated_data)

    return FileResponse(open(file_path, 'rb'))


@api_view(['POST'])
def speech_to_text_view(request):
    serializer = SpeechToTextSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    file = serializer.validated_data['file']

    file_path = (
        settings.MEDIA_ROOT / f"audios/{request.user.id}/speech_to_text/audio.mp3"
    )
    file_path.parent.mkdir(exist_ok=True, parents=True)

    if default_storage.exists(file_path):
        default_storage.delete(file_path)
    default_storage.save(file_path, file)

    text = speech_to_text(file_path)
    return Response({'text': text})
