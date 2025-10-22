from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Iterable, Mapping
from urllib import error as urllib_error
from urllib import request as urllib_request

from openai import OpenAI


MessagePayload = Mapping[str, str]


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
        prompt_parts = []
        for message in messages:
            role = message.get("role", "user")
            content = message.get("content", "")
            if not content:
                continue
            if role == "assistant":
                role_label = "Assistant"
            elif role == "system":
                role_label = "System"
            else:
                role_label = "User"
            prompt_parts.append(f"{role_label}: {content}")
        prompt = "\n\n".join(prompt_parts)
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt,
                        }
                    ]
                }
            ]
        }
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
            raise RuntimeError(f"Gemini API error: {exc.read().decode('utf-8')}") from exc

        parsed = json.loads(body)
        candidates = parsed.get("candidates", [])
        if not candidates:
            return ""
        content = candidates[0].get("content", {})
        parts = content.get("parts", [])
        if not parts:
            return ""
        return parts[0].get("text", "")
