from django.db import models


class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Category(TimestampedModel):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        ordering = ("name",)

    def __str__(self) -> str:
        return self.name


class Task(TimestampedModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        IN_PROGRESS = "in_progress", "In Progress"
        COMPLETED = "completed", "Completed"

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.ForeignKey(
        Category,
        related_name="tasks",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    class Meta:
        ordering = ("-created_at", "-id")

    def __str__(self) -> str:
        return self.title
