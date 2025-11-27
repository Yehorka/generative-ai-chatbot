from __future__ import annotations

from apis.services import NoAPIKeyException, get_api_key

from .providers import GeminiProvider, MistralProvider, OpenAIProvider


def get_provider(platform: str):
    platform_key = platform.lower()

    if platform_key == "openai":
        return OpenAIProvider(api_key=get_api_key("OPENAI_API_KEY"))

    if platform_key == "gemini":
        return GeminiProvider(api_key=get_api_key("GEMINI_API_KEY"))

    if platform_key == "mistral":
        return MistralProvider(api_key=get_api_key("MISTRAL_API_KEY"))

    raise NoAPIKeyException(f"Unsupported LLM platform: {platform}")
