from openai import OpenAI

from web_aplication.settings import OPENAI_API_KEY
from .models import Chat, Message


class NoAPIKeyException(Exception):
    pass


if not OPENAI_API_KEY:
    raise NoAPIKeyException()


client = OpenAI(api_key=OPENAI_API_KEY)


def get_ai_response(gpt_model: str, message_list: list[dict['str', 'str']]):
    completion = client.chat.completions.create(
        model=gpt_model,
        messages=message_list,
    )
    return completion.choices[0].message.content


def get_ai_message(chat: Chat, message_text: str) -> Message:
    Message(chat=chat, role=Message.RoleChoices.USER, content=message_text).save()

    messages = Message.objects.filter(chat=chat).order_by("timestamp")

    message_list = [
        {"role": message.role, "content": message.content} for message in messages
    ]

    ai_responce = get_ai_response(str(chat.gpt_model), message_list)

    ai_message = Message(
        chat=chat, role=Message.RoleChoices.ASSISTANT, content=ai_responce
    )
    ai_message.save()

    return ai_message
