from __future__ import annotations

from django.conf import settings

from apis.services import NoAPIKeyException, get_api_key

from .providers import GeminiProvider, OpenAIProvider


def get_provider(platform: str):
    platform_key = platform.lower()

    if platform_key == "openai":
        api_key = _resolve_api_key("OPENAI_API_KEY", settings.OPENAI_API_KEY)
        return OpenAIProvider(api_key=api_key)

    if platform_key == "gemini":
        gemini_api_key = _resolve_api_key(
            "GEMINI_API_KEY", getattr(settings, "GEMINI_API_KEY", None)
        )
        return GeminiProvider(api_key=gemini_api_key)

    raise NoAPIKeyException(f"Unsupported LLM platform: {platform}")


def _resolve_api_key(name: str, fallback: str | None) -> str:
    try:
        return get_api_key(name)
    except NoAPIKeyException:
        if fallback:
            return fallback
        raise NoAPIKeyException(f"{name} is not configured.")
