from django.contrib import admin

from .models import APIKey, InstructionFile


@admin.register(APIKey)
class APIKeyAdmin(admin.ModelAdmin):
    pass


@admin.register(InstructionFile)
class InstructionFileAdmin(admin.ModelAdmin):
    list_display = ("name", "uploaded_at")
