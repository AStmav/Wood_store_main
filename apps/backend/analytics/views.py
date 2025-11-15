from rest_framework import generics, permissions

from .models import ProductView, SiteVisit
from .serializers import ProductViewSerializer, SiteVisitSerializer


def _get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


class BaseAnalyticsCreateAPIView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        request = self.request
        if not request.session.session_key:
            request.session.save()

        serializer.save(
            user=request.user if request.user.is_authenticated else None,
            session_id=request.session.session_key or '',
            ip_address=_get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            referrer=serializer.validated_data.get('referrer') or request.META.get('HTTP_REFERER', ''),
        )


class ProductViewCreateAPIView(BaseAnalyticsCreateAPIView):
    queryset = ProductView.objects.all()
    serializer_class = ProductViewSerializer


class SiteVisitCreateAPIView(BaseAnalyticsCreateAPIView):
    queryset = SiteVisit.objects.all()
    serializer_class = SiteVisitSerializer


