from __future__ import annotations

import json
from dataclasses import dataclass
from collections.abc import Mapping
from typing import Iterable, Any
from urllib import error as urllib_error
from urllib import request as urllib_request

from openai import OpenAI


MessagePayload = Mapping[str, Any]


@dataclass
class OpenAIProvider:
    api_key: str

    def complete(self, messages: Iterable[MessagePayload], model_name: str) -> str:
        client = OpenAI(api_key=self.api_key)
        response = client.chat.completions.create(
            model=model_name,
            messages=list(messages),
        )
        return response.choices[0].message.content


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
