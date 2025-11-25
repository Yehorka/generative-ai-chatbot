from rest_framework.permissions import IsAdminUser
from pathlib import Path

from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import api_view
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework import status

from .models import APIKey, InstructionFile
from .serializers import APIKeySerializer, InstructionFileSerializer
from .services import (
    NoAPIKeyException,
    parse_instruction_file,
    refresh_instruction_cache,
)


class APIKeyViewSet(ModelViewSet):
    model = APIKey
    serializer_class = APIKeySerializer
    permission_classes = [IsAdminUser]
    queryset = APIKey.objects.all()


class InstructionFileViewSet(ModelViewSet):
    model = InstructionFile
    serializer_class = InstructionFileSerializer
    permission_classes = [IsAdminUser]
    queryset = InstructionFile.objects.all()
    parser_classes = [MultiPartParser, FormParser]

    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
    ALLOWED_EXTENSIONS = {".txt", ".pdf", ".doc", ".docx", ".md"}

    def create(self, request, *args, **kwargs):
        upload = request.FILES.get("file")
        if not upload:
            return Response(
                {"file": ["Instruction file is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if upload.size > self.MAX_FILE_SIZE:
            return Response(
                {"file": ["Файл завеликий. Максимальний розмір — 5 МБ."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        extension = Path(upload.name).suffix.lower()
        if extension and extension not in self.ALLOWED_EXTENSIONS:
            return Response(
                {"file": ["Непідтримуваний формат файлу. Дозволені: txt, pdf, doc, docx, md."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            parsed_content = parse_instruction_file(upload)
        except NoAPIKeyException as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as exc:  # pragma: no cover - propagate unexpected errors
            return Response(
                {"detail": f"Не вдалося опрацювати інструкцію: {exc}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        instruction = InstructionFile.objects.create(
            name=upload.name,
            parsed_content=parsed_content,
        )

        refresh_instruction_cache()
        serializer = self.get_serializer(instance=instruction)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        response = super().destroy(request, *args, **kwargs)
        refresh_instruction_cache()
        return response

@api_view(['GET'])
def check_admin(request):
    if request.user.is_authenticated and request.user.is_staff:

        return Response({'is_admin': True})
    return Response({'is_admin': False})
