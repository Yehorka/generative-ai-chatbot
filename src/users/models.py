from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    class UserTypeChoices(models.TextChoices):
        TEACHER = 'teacher'
        STUDENT = 'student'

    user_type = models.CharField(max_length=10, choices=UserTypeChoices.choices)

