from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from .models import About
from .serializers import AboutSerializer
from .services import AboutService


class AboutViewSet(viewsets.ModelViewSet):
    queryset = About.objects.all()
    serializer_class = AboutSerializer

    def get_permissions(self):
        """GET запросы доступны всем, остальные только админам"""
        if self.action in ['list', 'retrieve', 'active']:
            return [AllowAny()]
        return [IsAdminUser()]
    
    def get_queryset(self):
        """Возвращает queryset с фильтрацией"""
        if getattr(self, 'swagger_fake_view', False):
            return About.objects.none()
        
        queryset = About.objects.all()
        
        # Фильтрация по активности
        if self.action == 'list':
            queryset = queryset.filter(is_active=True)
        
        return queryset.order_by('-created_at')

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Получение активного раздела 'О нас'"""
        about = AboutService.get_active_about()
        if about:
            serializer = self.get_serializer(about)
            return Response(serializer.data)
        return Response(
            {'detail': 'Раздел "О нас" не найден'}, 
            status=status.HTTP_404_NOT_FOUND
        ) 