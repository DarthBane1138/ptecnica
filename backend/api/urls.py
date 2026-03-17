from django.urls import path

from .views import complete_task, suggest_subtasks, task_detail, tasks_collection

urlpatterns = [
    path("tasks/", tasks_collection, name="tasks-collection"),
    path("tasks/<int:task_id>/", task_detail, name="task-detail"),
    path("tasks/<int:task_id>/complete/", complete_task, name="task-complete"),
    path("suggest-subtasks/", suggest_subtasks, name="suggest-subtasks"),
]
