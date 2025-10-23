from urllib import error as urllib_error
from urllib import request as urllib_request

from django.core.exceptions import ObjectDoesNotExist
from openai import AuthenticationError, OpenAI
from rest_framework import status

from .models import APIKey


class NoAPIKeyException(Exception):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'API key does not exist.'
    default_code = 'no_api_key'


def get_api_key(name: str) -> str:
    normalized_name = name.upper()
    try:
        return APIKey.objects.values_list("key", flat=True).get(name=normalized_name)
    except ObjectDoesNotExist as exc:
        raise NoAPIKeyException(f"API key {normalized_name} does not exist") from exc


def check_openai_api_key(api_key: str) -> bool:
    try:
        OpenAI(api_key=api_key).models.list()
    except AuthenticationError:
        return False
    return True


def check_gemini_api_key(api_key: str) -> bool:
    url = "https://generativelanguage.googleapis.com/v1beta/models"
    request = urllib_request.Request(f"{url}?key={api_key}")
    try:
        with urllib_request.urlopen(request, timeout=10):
            return True
    except (urllib_error.HTTPError, urllib_error.URLError):
        return False


def get_openai_client():
    return OpenAI(api_key=get_api_key("OPENAI_API_KEY"))
