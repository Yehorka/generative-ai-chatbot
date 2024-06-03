from pathlib import Path

from apis.services import get_openai_client

TTS_MODEL_CHOICES = ('tts-1', 'tts-1-hd')
VOICE_CHOICES = ('alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer')


def text_to_speech(file_path: Path, data: dict) -> None:
    client = get_openai_client()
    response = client.audio.speech.create(**data)
    response.write_to_file(file_path)


def speech_to_text(file_path: Path) -> str:
    client = get_openai_client()
    audio_file = open(file_path, "rb")
    transcription = client.audio.transcriptions.create(
        model="whisper-1", file=audio_file
    )
    audio_file.close()
    return transcription.text
