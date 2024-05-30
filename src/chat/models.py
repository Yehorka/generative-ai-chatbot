import uuid

from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class Chat(models.Model):
    class GPTModelChoices(models.TextChoices):
        GPT_4 = 'gpt-4'
        GPT_3_5_TURBO = 'gpt-3.5-turbo'
        GPT_4O = 'gpt-4o'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, related_name='chats', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    gpt_model = models.CharField(
        max_length=20,
        choices=GPTModelChoices.choices,
        default=GPTModelChoices.GPT_3_5_TURBO,
    )

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Chat {self.pk}"


class Message(models.Model):
    class RoleChoices(models.TextChoices):
        SYSTEM = 'system'
        USER = 'user'
        ASSISTANT = 'assistant'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    chat = models.ForeignKey(Chat, related_name='messages', on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=RoleChoices.choices)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.role}: {self.content}"
