from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response

from .constants import PERSONAL_DATA_POLICY_SLUG, PRIVACY_POLICY_SLUG, TERMS_POLICY_SLUG
from .models import Page
from .serializers import PageSerializer
from .services import PageService


class PageViewSet(viewsets.ModelViewSet):
    queryset = Page.objects.all()
    serializer_class = PageSerializer
    lookup_field = 'uuid'

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'slug', 'site_config']:
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Page.objects.none()
        queryset = Page.objects.all()
        if self.action == 'list':
            queryset = queryset.filter(is_active=True)
        return queryset.order_by('title')

    @action(detail=False, methods=['get'], url_path='slug/(?P<slug>[^/.]+)')
    def slug(self, request, slug=None):
        page = PageService.get_active_page_by_slug(slug)
        if not page:
            return Response({'detail': 'Страница не найдена'}, status=status.HTTP_404_NOT_FOUND)
        return Response(PageSerializer(page).data)

    @action(detail=False, methods=['get'])
    def site_config(self, request):
        """Slugs юридических страниц для фронтенда."""
        return Response({
            'personal_data_policy_slug': PERSONAL_DATA_POLICY_SLUG,
            'privacy_policy_slug': PRIVACY_POLICY_SLUG,
            'terms_policy_slug': TERMS_POLICY_SLUG,
        })
