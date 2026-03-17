from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from typing import Dict, List

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response


@dataclass
class TaskRecord:
    id: int
    title: str
    description: str
    category: str
    status: str
    created_at: str
    updated_at: str


_TASKS: List[TaskRecord] = []
_NEXT_ID = 1


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _find_task(task_id: int) -> TaskRecord | None:
    for task in _TASKS:
        if task.id == task_id:
            return task
    return None


@api_view(["GET", "POST"])
def tasks_collection(request):
    global _NEXT_ID

    if request.method == "GET":
        return Response([asdict(task) for task in _TASKS])

    title = (request.data.get("title") or "").strip()
    description = (request.data.get("description") or "").strip()
    category = (request.data.get("category") or "").strip()

    if not title or not description or not category:
        return Response(
            {"detail": "title, description and category are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    timestamp = _now_iso()
    task = TaskRecord(
        id=_NEXT_ID,
        title=title,
        description=description,
        category=category,
        status="pending",
        created_at=timestamp,
        updated_at=timestamp,
    )
    _TASKS.append(task)
    _NEXT_ID += 1

    return Response(asdict(task), status=status.HTTP_201_CREATED)


@api_view(["GET", "DELETE"])
def task_detail(request, task_id: int):
    task = _find_task(task_id)
    if task is None:
        return Response({"detail": "Task not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        return Response(asdict(task))

    _TASKS.remove(task)
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
def complete_task(request, task_id: int):
    task = _find_task(task_id)
    if task is None:
        return Response({"detail": "Task not found."}, status=status.HTTP_404_NOT_FOUND)

    task.status = "completed"
    task.updated_at = _now_iso()
    return Response(asdict(task))


@api_view(["POST"])
def suggest_subtasks(request):
    title = (request.data.get("title") or "").strip()
    if not title:
        return Response({"detail": "title is required."}, status=status.HTTP_400_BAD_REQUEST)

    suggestions = [
        f"Plan steps for: {title}",
        f"Start first draft: {title}",
        f"Review and finish: {title}",
    ]
    return Response({"subtasks": suggestions})
