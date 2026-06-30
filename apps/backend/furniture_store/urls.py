"""
URL configuration for furniture_store project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
)
from rest_framework_simplejwt import authentication as jwt_auth
from users.views import MyTokenObtainPairView

# Swagger документация доступна только для админов или только в режиме DEBUG
from rest_framework.permissions import IsAdminUser

schema_view = get_schema_view(
   openapi.Info(
      title="Мебельный магазин API",
      default_version='v1',
      description="Документация для API мебельного магазина",
      terms_of_service="https://www.google.com/policies/terms/",
      contact=openapi.Contact(email="contact@furniture-store.local"),
      license=openapi.License(name="BSD License"),
   ),
   public=settings.DEBUG,  # Публичная только в режиме разработки
   permission_classes=(IsAdminUser if not settings.DEBUG else permissions.AllowAny,),
   authentication_classes=[] if settings.DEBUG else [jwt_auth.JWTAuthentication],
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('news.urls')),
    path('api/', include('about.urls')),  # Раздел "О нас"
    path('api/', include('pages.urls')),
    path('api/catalog/', include('catalog.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/users/', include('users.urls')),
    path('api/', include('analytics.urls')),
    
    # JWT аутентификация
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # Swagger документация
    path('swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
