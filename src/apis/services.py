import base64
from pathlib import Path
from urllib import error as urllib_error
from urllib import request as urllib_request

from django.core.exceptions import ObjectDoesNotExist
from django.db import OperationalError, ProgrammingError
from openai import AuthenticationError, OpenAI
from rest_framework import status

from .models import APIKey, InstructionFile


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


def check_mistral_api_key(api_key: str) -> bool:
    request = urllib_request.Request(
        "https://api.mistral.ai/v1/models",
        headers={"Authorization": f"Bearer {api_key}"},
    )
    try:
        with urllib_request.urlopen(request, timeout=10):
            return True
    except (urllib_error.HTTPError, urllib_error.URLError):
        return False


def get_openai_client():
    return OpenAI(api_key=get_api_key("OPENAI_API_KEY"))


def _resolve_openai_api_key() -> str:
    return get_api_key("OPENAI_API_KEY")


def _extract_text_from_response(payload) -> str:
    text_attr = getattr(payload, "text", None)
    if isinstance(text_attr, str) and text_attr:
        return text_attr

    text_response = getattr(payload, "output_text", None)
    if isinstance(text_response, str) and text_response:
        return text_response

    output_attr = getattr(payload, "output", None)
    if output_attr:
        chunks: list[str] = []
        for item in output_attr or []:
            content = getattr(item, "content", None)
            if not content:
                continue
            for part in content:
                text_value = getattr(part, "text", None)
                if text_value:
                    chunks.append(str(text_value))
        if chunks:
            return "".join(chunks)

    choices_attr = getattr(payload, "choices", None)
    if choices_attr:
        chunks: list[str] = []
        for choice in choices_attr or []:
            message = getattr(choice, "message", None)
            if not message:
                continue
            content = getattr(message, "content", None)
            if isinstance(content, str) and content:
                chunks.append(content)
                continue
            if isinstance(content, list):
                for part in content:
                    if isinstance(part, dict) and part.get("text"):
                        chunks.append(str(part["text"]))
        if chunks:
            return "".join(chunks)

    if hasattr(payload, "model_dump"):
        return _extract_text_from_response(payload.model_dump())

    if isinstance(payload, dict):
        if isinstance(payload.get("text"), str) and payload.get("text"):
            return str(payload["text"])
        if isinstance(payload.get("output_text"), str) and payload.get("output_text"):
            return str(payload["output_text"])
        chunks: list[str] = []
        for item in payload.get("output", []) or []:
            for part in item.get("content", []) or []:
                if isinstance(part, dict) and part.get("text"):
                    chunks.append(str(part["text"]))
        for choice in payload.get("choices", []) or []:
            message = choice.get("message") if isinstance(choice, dict) else None
            if not message:
                continue
            content = message.get("content") if isinstance(message, dict) else None
            if isinstance(content, str) and content:
                chunks.append(content)
            elif isinstance(content, list):
                for part in content:
                    if isinstance(part, dict) and part.get("text"):
                        chunks.append(str(part["text"]))
        if chunks:
            return "".join(chunks)

    return ""


def parse_instruction_file(upload) -> str:
    content_bytes = upload.read()
    upload.seek(0)
    decoded_content = content_bytes.decode("utf-8", errors="ignore")
    extension = Path(upload.name).suffix.lower()
    if extension == ".txt":
        return decoded_content.strip()

    import google.generativeai as genai

    genai.configure(api_key=get_api_key("GEMINI_API_KEY"))
    model = genai.GenerativeModel("gemini-2.5-flash-lite")

    b64_content = base64.b64encode(content_bytes).decode("utf-8")
    prompt = (
        "You will receive the content of an instruction document. "
        "Return a faithful plain-text rendition preserving headings, lists, and important structure. "
        "Do not summarize or omit details. If the text seems encoded, use the provided base64 content to recover it."
    )

    response = model.generate_content(
        [
            prompt,
            (
                f"File name: {upload.name}\n\n"
                "UTF-8 interpretation of the file contents follows. "
                "If characters look corrupted, rely on the base64 block below.\n\n"
                f"UTF-8 content:\n{decoded_content}\n\nBase64 content:\n{b64_content}"
            ),
        ]
    )

    parsed_text = _extract_text_from_response(response)
    return (parsed_text or decoded_content or "").strip()


def _load_instructions_from_db() -> str:
    try:
        contents = InstructionFile.objects.order_by("uploaded_at").values_list(
            "parsed_content", flat=True
        )
        normalized = [content.strip() for content in contents if content]
        return "\n\n".join(normalized)
    except (OperationalError, ProgrammingError):
        return ""


_instruction_cache: str | None = None


def refresh_instruction_cache() -> str:
    global _instruction_cache
    _instruction_cache = _load_instructions_from_db()
    return _instruction_cache


def get_instruction_text() -> str:
    global _instruction_cache
    if _instruction_cache is None:
        return refresh_instruction_cache()
    return _instruction_cache
