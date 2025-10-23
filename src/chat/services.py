from __future__ import annotations

from typing import Iterable

from apis.services import NoAPIKeyException

from app.llm.factory import get_provider

from .models import Chat, Message


def _serialize_messages(messages: Iterable[Message]) -> list[dict[str, str]]:
    return [
        {"role": message.role, "content": message.content}
        for message in messages
    ]


def get_ai_response(
    gpt_model: str,
    message_list: Iterable[dict[str, str]],
    *,
    platform: str = "openai",
    model_name: str | None = None,
) -> str:
    provider = get_provider(platform)
    try:
        return provider.complete(list(message_list), model_name or gpt_model)
    except NoAPIKeyException:
        raise
    except Exception as exc:  # pragma: no cover - propagate provider errors
        raise RuntimeError("Failed to generate response from provider") from exc


def get_ai_message(chat: Chat, message_text: str) -> Message:
    Message.objects.create(chat=chat, role=Message.RoleChoices.USER, content=message_text)

    messages = chat.messages.order_by("timestamp")
    serialized_messages = _serialize_messages(messages)

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
