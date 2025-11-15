from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.shortcuts import get_object_or_404
from .models import News
from .serializers import NewsListSerializer, NewsDetailSerializer
from .services import NewsService


class NewsViewSet(viewsets.ModelViewSet):
    queryset = News.objects.all()
    serializer_class = NewsListSerializer
    lookup_field = 'uuid'

    def get_permissions(self):
        """GET запросы доступны всем, остальные только админам"""
        if self.action in ['list', 'retrieve', 'active', 'slug']:
            return [AllowAny()]
        return [IsAdminUser()]
    
    def get_serializer_class(self):
        """Возвращает сериализатор в зависимости от действия"""
        if self.action == 'retrieve':
            return NewsDetailSerializer
        return NewsListSerializer
    
    def get_queryset(self):
        """Возвращает queryset с фильтрацией"""
        if getattr(self, 'swagger_fake_view', False):
            return News.objects.none()
        
        queryset = News.objects.all()
        
        # Фильтрация по активности
        if self.action == 'list':
            queryset = queryset.filter(is_active=True)
        
        return queryset.order_by('-published_at')

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Получение активных новостей с лимитом"""
        limit = request.query_params.get('limit', 6)
        try:
            limit = int(limit)
        except ValueError:
            limit = 6
        
        news = NewsService.get_active_news(limit=limit)
        serializer = self.get_serializer(news, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='slug/(?P<slug>[^/.]+)')
    def slug(self, request, slug=None):
        """Получение новости по slug"""
        try:
            news = NewsService.get_news_by_slug(slug)
            if not news:
                return Response(
                    {'detail': 'Новость не найдена'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            serializer = NewsDetailSerializer(news)
            return Response(serializer.data)
        except News.DoesNotExist:
            return Response(
                {'detail': 'Новость не найдена'}, 
                status=status.HTTP_404_NOT_FOUND
            )

    def retrieve(self, request, *args, **kwargs):
        """Возвращает детальную информацию о новости"""
        news = self.get_object()
        serializer = self.get_serializer(news)
        return Response(serializer.data)


        