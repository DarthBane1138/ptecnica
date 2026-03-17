from django.http import HttpResponse
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.response import Response

from .models import Category, Task
from .serializers import CategorySerializer, SuggestSubtasksSerializer, TaskSerializer
from .services.openai_service import OpenAIServiceError, suggest_subtasks_with_openai


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.select_related("category").all()
    serializer_class = TaskSerializer

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        task = self.get_object()
        task.status = Task.Status.COMPLETED
        task.save(update_fields=["status", "updated_at"])
        serializer = self.get_serializer(task)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


@api_view(["POST"])
def suggest_subtasks(request):
    serializer = SuggestSubtasksSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    title = serializer.validated_data["title"].strip()
    try:
        result = suggest_subtasks_with_openai(title)
    except OpenAIServiceError as exc:
        return Response({"detail": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    return Response(
        {"title": result.title, "subtasks": result.subtasks},
        status=status.HTTP_200_OK,
    )


def healthcheck(_request):
    return HttpResponse("ok", content_type="text/plain")
