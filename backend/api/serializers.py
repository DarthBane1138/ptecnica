from rest_framework import serializers

from .models import Category, Task


class TaskSerializer(serializers.ModelSerializer):
    category = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Task
        fields = (
            "id",
            "title",
            "description",
            "category",
            "status",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "status", "created_at", "updated_at")

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["category"] = instance.category.name if instance.category else ""
        return data

    def _get_category(self, category_name: str | None):
        if not category_name:
            return None

        normalized_name = category_name.strip()
        if not normalized_name:
            return None

        category, _ = Category.objects.get_or_create(name=normalized_name)
        return category

    def create(self, validated_data):
        category_name = validated_data.pop("category", "")
        validated_data["category"] = self._get_category(category_name)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if "category" in validated_data:
            category_name = validated_data.pop("category")
            instance.category = self._get_category(category_name)

        return super().update(instance, validated_data)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name")


class SuggestSubtasksSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200)
