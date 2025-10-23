import uuid

from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class Chat(models.Model):
    class GPTModelChoices(models.TextChoices):
        GPT_4O_MINI = 'gpt-4o-mini'
        GPT_4O = 'gpt-4o'
        GPT_5 = 'gpt-5'

    PLATFORM_CHOICES = [
        ("openai", "OpenAI"),
        ("gemini", "Gemini"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, related_name='chats', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    gpt_model = models.CharField(
        max_length=20,
        choices=GPTModelChoices.choices,
        default=GPTModelChoices.GPT_4O_MINI,
    )
    platform = models.CharField(
        max_length=10,
        choices=PLATFORM_CHOICES,
        default="openai",
    )
    model_name = models.CharField(
        max_length=50,
        default="gpt-4o-mini",
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
    image = models.FileField(upload_to="chat_images/", blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.role}: {self.content}"