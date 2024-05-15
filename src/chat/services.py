from openai import OpenAI
import openai

from web_aplication.settings import OPENAI_API_KEY
from .models import Chat, Message


class NoAPIKeyException(Exception):
    pass


if not OPENAI_API_KEY:
    raise NoAPIKeyException()


client = OpenAI(api_key=OPENAI_API_KEY)


def get_ai_response(chat: Chat, message_text: str) -> Message:
    Message(chat=chat, role=Message.RoleChoices.USER, content=message_text).save()

    messages = Message.objects.filter(chat=chat).order_by("timestamp")

    message_list = [
        {"role": message.role, "content": message.content} for message in messages
    ]
    


    completion = client.chat.completions.create(
        model=chat.gpt_model,
        messages=message_list,
    )

    ai_responce = completion.choices[0].message.content
    ai_message = Message(
        chat=chat, role=Message.RoleChoices.ASSISTANT, content=ai_responce
    )
    ai_message.save()

    return ai_message

def transcribe_audio(file_path):
        with open(file_path, 'rb') as audio:
            response = client.audio.transcriptions.create(model="whisper-1",
                file=audio)
            return response.text
