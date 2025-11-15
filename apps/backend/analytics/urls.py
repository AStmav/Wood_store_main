from django.urls import path

from .views import ProductViewCreateAPIView, SiteVisitCreateAPIView

app_name = 'analytics'

urlpatterns = [
    path('analytics/product-views/', ProductViewCreateAPIView.as_view(), name='product-view'),
    path('analytics/site-visits/', SiteVisitCreateAPIView.as_view(), name='site-visit'),
]


