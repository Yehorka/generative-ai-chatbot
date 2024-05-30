from django.core.exceptions import ObjectDoesNotExist
from openai import AuthenticationError, OpenAI
from rest_framework import status
from rest_framework.decorators import api_view
from django.shortcuts import redirect

from .models import APIKey


class NoAPIKeyException(Exception):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'API key does not exist.'
    default_code = 'no_api_key'



def get_api_key(name: str) -> str:
    try:
        return APIKey.objects.get(name=name).key
    except ObjectDoesNotExist:
        raise NoAPIKeyException(f"Api key {name} does not excist")


def check_openai_api_key(api_key: str) -> bool:
    client = OpenAI(api_key=api_key)
    try:
        client.models.list()
    except AuthenticationError:
        return False
    return True


def get_openai_client():
    api_key = get_api_key("OPENAI_API_KEY")
    client = OpenAI(api_key=api_key)
    return client
