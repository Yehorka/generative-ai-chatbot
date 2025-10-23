from __future__ import annotations

import json
from dataclasses import dataclass
from collections.abc import Iterable, Mapping
from typing import Any, Sequence
from urllib import error as urllib_error
from urllib import request as urllib_request

from openai import OpenAI


MessagePayload = Mapping[str, Any]


@dataclass
class OpenAIProvider:
    api_key: str

    def complete(self, messages: Iterable[MessagePayload], model_name: str) -> str:
        message_list = list(messages)
        client = OpenAI(api_key=self.api_key)

        if self._should_use_responses_api(model_name):
            return self._complete_with_responses_api(client, message_list, model_name)

        response = client.chat.completions.create(
            model=model_name,
            messages=message_list,
        )
        return response.choices[0].message.content

    @staticmethod
    def _should_use_responses_api(model_name: str) -> bool:
        normalized = (model_name or "").strip().lower()
        return normalized.startswith("gpt-5")

    def _complete_with_responses_api(
        self,
        client: OpenAI,
        messages: Sequence[MessagePayload],
        model_name: str,
    ) -> str:
        converted_messages = self._convert_messages_for_responses(messages)
        response = client.responses.create(
            model=model_name,
            input=converted_messages,
        )

        text_response = getattr(response, "output_text", None)
        if text_response:
            return text_response

        # Fallback: iterate over structured content in the response payload.
        output_chunks: list[str] = []
        for item in getattr(response, "output", []) or []:
            for part in getattr(item, "content", []) or []:
                part_type = getattr(part, "type", None)
                if part_type in {"output_text", "text"}:
                    text_value = getattr(part, "text", None)
                    if text_value:
                        output_chunks.append(text_value)
        if output_chunks:
            return "".join(output_chunks)

        if hasattr(response, "model_dump"):
            dumped = response.model_dump()
            candidates = dumped.get("output", [])
            for candidate in candidates:
                for part in candidate.get("content", []) or []:
                    text_value = part.get("text")
                    if text_value:
                        output_chunks.append(str(text_value))
            if output_chunks:
                return "".join(output_chunks)

        return ""

    @staticmethod
    def _convert_messages_for_responses(
        messages: Sequence[MessagePayload],
    ) -> list[dict[str, object]]:
        converted: list[dict[str, object]] = []
        for message in messages:
            role = str(message.get("role", "user") or "user")
            raw_content = message.get("content", "")

            parts: list[dict[str, object]] = []
            if isinstance(raw_content, list):
                for part in raw_content:
                    if not isinstance(part, Mapping):
                        continue
                    part_type = part.get("type")
                    if part_type in {"text", "input_text", "output_text"}:
                        text_value = part.get("text")
                        if text_value:
                            mapped_type = (
                                "output_text" if role == "assistant" else "input_text"
                            )
                            parts.append({"type": mapped_type, "text": str(text_value)})
                    elif part_type in {"image_url", "input_image"}:
                        image_payload = part.get("image_url")
                        if isinstance(image_payload, Mapping):
                            image_url = image_payload.get("url")
                        else:
                            image_url = image_payload if isinstance(image_payload, str) else None
                        if image_url:
                            parts.append(
                                {
                                    "type": "input_image",
                                    "image_url": {"url": str(image_url)},
                                }
                            )
            else:
                text_value = str(raw_content or "")
                if text_value:
                    mapped_type = "output_text" if role == "assistant" else "input_text"
                    parts.append({"type": mapped_type, "text": text_value})

            if not parts:
                parts.append({"type": "input_text", "text": ""})

            converted.append({"role": role, "content": parts})

        return converted


@dataclass
class GeminiProvider:
    api_key: str

    def complete(self, messages: Iterable[MessagePayload], model_name: str) -> str:
        contents: list[dict[str, object]] = []
        system_instruction: dict[str, object] | None = None

        for message in messages:
            role = message.get("role", "user") or "user"
            raw_content = message.get("content", "")
            if isinstance(raw_content, list):
                text_parts: list[str] = []
                for part in raw_content:
                    if not isinstance(part, Mapping):
                        continue
                    if part.get("type") == "text" and part.get("text"):
                        text_parts.append(str(part.get("text")))
                content = "\n".join(text_parts)
            else:
                content = str(raw_content or "")
            if not content:
                continue

            if role == "system":
                system_instruction = {
                    "role": "system",
                    "parts": [{"text": content}],
                }
                continue

            mapped_role = "model" if role == "assistant" else "user"
            contents.append(
                {
                    "role": mapped_role,
                    "parts": [{"text": content}],
                }
            )

        if not contents and not system_instruction:
            return ""

        payload: dict[str, object] = {
            "contents": contents
            or [
                {
                    "role": "user",
                    "parts": [{"text": ""}],
                }
            ]
        }
        if system_instruction:
            payload["systemInstruction"] = system_instruction

        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{model_name}:generateContent?key={self.api_key}"
        )
        request = urllib_request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
        )
        try:
            with urllib_request.urlopen(request) as response:
                body = response.read().decode("utf-8")
        except urllib_error.HTTPError as exc:  # pragma: no cover - API error handling
            error_payload = exc.read().decode("utf-8", errors="ignore")
            raise RuntimeError(
                f"Gemini API error ({exc.code}): {error_payload}"
            ) from exc
        except urllib_error.URLError as exc:  # pragma: no cover - network error handling
            raise RuntimeError(f"Gemini API connection error: {exc.reason}") from exc

        try:
            parsed = json.loads(body)
        except json.JSONDecodeError as exc:  # pragma: no cover - unexpected API response
            raise RuntimeError(f"Gemini API returned invalid JSON: {body}") from exc
        candidates = parsed.get("candidates", [])
        if not candidates:
            return ""
        content = candidates[0].get("content", {})
        parts = content.get("parts", [])
        if not parts:
            return ""
        return parts[0].get("text", "")
