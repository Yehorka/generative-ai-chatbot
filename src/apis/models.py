from django.db import models


class APIKey(models.Model):
    name = models.CharField(max_length=20, unique=True)
    key = models.CharField(max_length=100)
