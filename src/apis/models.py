from django.db import models


class APIKey(models.Model):
    name = models.CharField(max_length=20, unique=True)
    key = models.CharField(max_length=200)


class InstructionFile(models.Model):
    name = models.CharField(max_length=255)
    parsed_content = models.TextField()
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-uploaded_at"]

    def __str__(self) -> str:  # pragma: no cover - representation helper
        return self.name
