from __future__ import annotations

import base64
import mimetypes
from typing import Iterable, Any

from django.core.files.base import File

from apis.services import NoAPIKeyException
from apis.services import get_instruction_text

from app.llm.factory import get_provider

from .models import Chat, Message


def _serialize_messages(messages: Iterable[Message]) -> list[dict[str, Any]]:
    serialized: list[dict[str, Any]] = []
    for message in messages:
        parts: list[dict[str, Any]] = []

        content = getattr(message, "content", "") or ""
        if content:
            parts.append({"type": "text", "text": content})

        image_file: File | None = getattr(message, "image", None)
        if (
            image_file
            and message.role == Message.RoleChoices.USER
            and hasattr(image_file, "open")
        ):
            with image_file.open("rb") as image_stream:
                encoded = base64.b64encode(image_stream.read()).decode("utf-8")
            mime_type, _ = mimetypes.guess_type(image_file.name)
            data_url = f"data:{mime_type or 'image/png'};base64,{encoded}"
            parts.append(
                {
                    "type": "image_url",
                    "image_url": {"url": data_url, "detail": "high"},
                }
            )

        serialized.append({
            "role": message.role,
            "content": parts or [{"type": "text", "text": ""}],
        })

    return serialized


_GEMINI_MODEL_ALIASES: dict[str, str] = {
    "gemini-1.5-pro": "gemini-2.5-flash-lite",
    "models/gemini-1.5-pro": "gemini-2.5-flash-lite",
}


def _normalize_model_name(platform: str, model_name: str | None) -> str | None:
    normalized = (model_name or "").strip()
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

    instruction_text = get_instruction_text()
    if instruction_text:
        serialized_messages.insert(
            0,
            {
                "role": Message.RoleChoices.SYSTEM,
                "content": [{"type": "text", "text": instruction_text}],
            },
        )

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
