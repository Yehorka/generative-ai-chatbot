from pathlib import Path

from chat.services import get_client

MODLE_CHOICES = ('tts-1', 'tts-1-hd')
VOICE_CHOICES = ('alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer')


def text_to_speech(file_path: Path, data: dict) -> None:
    client = get_client()
    response = client.audio.speech.create(**data)
    response.write_to_file(file_path)
