from rest_framework import serializers

from .services import MODLE_CHOICES, VOICE_CHOICES


class TextToSpeechSerializer(serializers.Serializer):
    model = serializers.ChoiceField(choices=MODLE_CHOICES, default=MODLE_CHOICES[0])
    voice = serializers.ChoiceField(choices=VOICE_CHOICES, default=VOICE_CHOICES[0])
    input = serializers.CharField()
