# Generated manually to add platform and model_name fields
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("chat", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="chat",
            name="platform",
            field=models.CharField(
                choices=[("openai", "OpenAI"), ("gemini", "Gemini")],
                default="openai",
                max_length=10,
            ),
        ),
        migrations.AddField(
            model_name="chat",
            name="model_name",
            field=models.CharField(default="gpt-4o-mini", max_length=50),
        ),
    ]
