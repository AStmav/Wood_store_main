from rest_framework import serializers

from .models import Page


class PageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Page
        fields = ('uuid', 'title', 'slug', 'content', 'is_active', 'created_at', 'updated_at')
        read_only_fields = ('uuid', 'created_at', 'updated_at')
