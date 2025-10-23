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
        return APIKey.objects.get(name=normalized_name).key
    except ObjectDoesNotExist as exc:
        raise NoAPIKeyException(f"API key {normalized_name} does not exist") from exc


def check_openai_api_key(api_key: str) -> bool:
    client = OpenAI(api_key=api_key)
    try:
        client.models.list()
    except AuthenticationError:
        return False
    return True


def check_gemini_api_key(api_key: str) -> bool:
    url = "https://generativelanguage.googleapis.com/v1beta/models"
    request = urllib_request.Request(f"{url}?key={api_key}")
    try:
        with urllib_request.urlopen(request, timeout=10):
            return True
    except urllib_error.HTTPError:
        return False
    except urllib_error.URLError:
        return False


def get_openai_client():
    api_key = get_api_key("OPENAI_API_KEY")
    client = OpenAI(api_key=api_key)
    return client
