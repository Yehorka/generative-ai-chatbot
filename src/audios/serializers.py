from rest_framework import serializers

from .services import TTS_MODEL_CHOICES, VOICE_CHOICES


class TextToSpeechSerializer(serializers.Serializer):
    model = serializers.ChoiceField(
        choices=TTS_MODEL_CHOICES, default=TTS_MODEL_CHOICES[0]
    )
    voice = serializers.ChoiceField(choices=VOICE_CHOICES, default=VOICE_CHOICES[0])
    input = serializers.CharField()


class SpeechToTextSerializer(serializers.Serializer):
    file = serializers.FileField()
