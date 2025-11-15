from rest_framework import serializers
from .models import About


class AboutSerializer(serializers.ModelSerializer):
    """Сериализатор для раздела 'О нас'"""
    
    class Meta:
        model = About
        fields = ["id", "title", "content", "image", "is_active", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"] 