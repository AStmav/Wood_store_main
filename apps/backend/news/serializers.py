from rest_framework import serializers
from .models import News

class NewsListSerializer(serializers.ModelSerializer):
    """Сериализатор для списка новостей"""
    excerpt = serializers.SerializerMethodField()

    class Meta:
        model = News
        fields = ["uuid", "title", "excerpt", "published_at", "is_active", "slug", "image"]
        read_only_fields = ["uuid", "slug"]
    
    def get_excerpt(self, obj):
        return obj.get_excerpt()


class NewsDetailSerializer(serializers.ModelSerializer):
    """Сериализатор для детального просмотра новости"""
    excerpt = serializers.SerializerMethodField() 
    
    class Meta:
        model = News
        fields = ["uuid", "title", "content", "excerpt", "published_at", "is_active", "slug", "image"]
        read_only_fields = ["uuid", "slug"]
    
    def get_excerpt(self, obj):
        return obj.get_excerpt()