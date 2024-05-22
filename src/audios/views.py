from django.conf import settings
from django.http import FileResponse
from rest_framework.decorators import api_view

from .services import text_to_speech
from .serializers import TextToSpeechSerializer


@api_view(['POST'])
def text_to_speech_view(request):
    serializer = TextToSpeechSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    file_path = settings.MEDIA_ROOT / f"audios/{request.user.id}/speach/audio.mp3"
    file_path.parent.mkdir(exist_ok=True, parents=True)

    text_to_speech(file_path, serializer.validated_data)

    return FileResponse(open(file_path, 'rb'))
