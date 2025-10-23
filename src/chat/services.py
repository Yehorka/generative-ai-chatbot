from __future__ import annotations

import base64
import mimetypes
from typing import Iterable, Any

from apis.services import NoAPIKeyException

from app.llm.factory import get_provider

from .models import Chat, Message


def _serialize_messages(messages: Iterable[Message]) -> list[dict[str, Any]]:
    serialized: list[dict[str, Any]] = []
    for message in messages:
        parts: list[dict[str, Any]] = []
        if message.content:
            parts.append({"type": "text", "text": message.content})

        if message.image:
            with message.image.open("rb") as image_file:
                encoded = base64.b64encode(image_file.read()).decode("utf-8")
            mime_type, _ = mimetypes.guess_type(message.image.name)
            data_url = f"data:{mime_type or 'image/png'};base64,{encoded}"
            parts.append(
                {
                    "type": "image_url",
                    "image_url": {"url": data_url},
                }
            )

        if not parts:
            serialized.append({"role": message.role, "content": ""})
        elif len(parts) == 1 and parts[0]["type"] == "text":
            serialized.append({"role": message.role, "content": parts[0]["text"]})
        else:
            serialized.append({"role": message.role, "content": parts})

    return serialized


_GEMINI_MODEL_ALIASES: dict[str, str] = {
    "gemini-1.5-pro": "gemini-2.5-flash-lite",
    "models/gemini-1.5-pro": "gemini-2.5-flash-lite",
}


def _normalize_model_name(platform: str, model_name: str | None) -> str | None:
    if not model_name:
        return None

    normalized = model_name.strip()
    if not normalized:
        return None

    if platform.lower() == "gemini":
        return _GEMINI_MODEL_ALIASES.get(normalized, normalized)

    return normalized


def get_ai_response(
    gpt_model: str,
    message_list: Iterable[dict[str, Any]],
    *,
    platform: str = "openai",
    model_name: str | None = None,
) -> str:
    provider = get_provider(platform)
    try:
        resolved_model = _normalize_model_name(platform, model_name) or gpt_model
        return provider.complete(list(message_list), resolved_model)
    except NoAPIKeyException:
        raise
    except Exception as exc:  # pragma: no cover - propagate provider errors
        raise RuntimeError(
            f"Failed to generate response from provider: {exc}"
        ) from exc


def get_ai_message(chat: Chat, message_text: str, *, image_file=None) -> Message:
    Message.objects.create(
        chat=chat,
        role=Message.RoleChoices.USER,
        content=message_text,
        image=image_file,
    )

    messages = chat.messages.order_by("timestamp")
    serialized_messages = _serialize_messages(messages)

    normalized_model = _normalize_model_name(chat.platform, chat.model_name)
    if normalized_model and normalized_model != chat.model_name:
        chat.model_name = normalized_model
        chat.save(update_fields=["model_name"])

    response_content = get_ai_response(
        str(chat.gpt_model),
        serialized_messages,
        platform=chat.platform,
        model_name=chat.model_name or str(chat.gpt_model),
    )

    ai_message = Message.objects.create(
        chat=chat,
        role=Message.RoleChoices.ASSISTANT,
        content=response_content,
    )

    return ai_message


def transcribe_audio(file_path):
    raise NotImplementedError("Transcription is not implemented in this context")
