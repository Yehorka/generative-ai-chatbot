from rest_framework import serializers

from .models import APIKey
from .services import (
    check_gemini_api_key,
    check_mistral_api_key,
    check_openai_api_key,
)


SUPPORTED_API_KEYS = {
    "OPENAI_API_KEY": check_openai_api_key,
    "GEMINI_API_KEY": check_gemini_api_key,
    "MISTRAL_API_KEY": check_mistral_api_key,
}


class APIKeySerializer(serializers.ModelSerializer):

    class Meta:
        model = APIKey
        fields = "__all__"
        read_only_fields = ["id"]

    def validate(self, attrs):
        attrs = super().validate(attrs)
        name = attrs.get("name") or getattr(self.instance, "name", None)
        key = attrs.get("key")

        if not name:
            raise serializers.ValidationError({"name": "API key name is required."})

        normalized_name = name.upper()
        validator = SUPPORTED_API_KEYS.get(normalized_name)
        if validator is None:
            raise serializers.ValidationError({"name": "Unsupported API key name."})

        if key is not None and not validator(key):
            raise serializers.ValidationError({"key": "Api key is not valid"})

        attrs["name"] = normalized_name
        return attrs
