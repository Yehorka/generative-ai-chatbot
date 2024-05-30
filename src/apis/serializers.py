from rest_framework import serializers

from .models import APIKey
from .services import check_openai_api_key


def validate_key(key: str) -> None:
    if not check_openai_api_key(key):
        raise serializers.ValidationError('Api key is not valid')


class APIKeySerializer(serializers.ModelSerializer):
    key = serializers.CharField(validators=[validate_key])

    class Meta:
        model = APIKey
        fields = "__all__"
        read_only = ['id']

    def validate_key(self, value):
        if not check_openai_api_key(value):
            raise serializers.ValidationError('Api key is not valid')
        return value
