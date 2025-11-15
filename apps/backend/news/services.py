from django.db.models import Q
from .models import News

class NewsService:
    """Сервис для работы с новостями"""

    @staticmethod
    def get_active_news(limit=None):
        """Получаем активные новости"""
        queryset =  News.objects.filter(is_active=True).order_by('-published_at')
        if limit:
            queryset = queryset[:limit]
        return queryset
    
    @staticmethod
    def get_news_by_slug(slug):
        """Получение новости по slug"""
        try:
            return News.objects.get(slug=slug, is_active=True)
        except News.DoesNotExist:
            return None
    

    @staticmethod
    def get_news_by_uuid(uuid):
        """Получение новости по UUID"""
        try:
            return News.objects.get(uuid=uuid, is_active=True)
        except News.DoesNotExist:
            return None
    
    @staticmethod
    def search_news(query):
        """Поиск новостей по запросу"""
        if not query:
            return News.objects.filter(is_active=True).order_by('-published_at')
        
        return News.objects.filter(
            Q(title__icontains=query) | 
            Q(content__icontains=query) | 
            Q(excerpt__icontains=query),
            is_active=True
        ).order_by('-published_at')
    
