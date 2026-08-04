from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny
from django.core.cache import cache
from django.db import models

from .models import Product, Category
from .serializers import (
    ProductListSerializer,
    ProductDetailSerializer,
    CategorySerializer,
    CategoryTreeSerializer,
    CategoryDetailSerializer,
)
from .services import ProductService
from .product_filters import filter_products_queryset
from .category_tree import collect_sleep_sizes, get_descendant_pks
from .lookup import resolve_by_slug_or_uuid

FILTERS_CACHE_KEY = 'catalog:product_filters:v2'
FILTERS_CACHE_TTL = 300
FEATURED_CACHE_TTL = 120
TREE_CACHE_KEY = 'catalog:category_tree:v2'
TREE_CACHE_TTL = 300


def _cache_get(key):
    try:
        return cache.get(key)
    except Exception:
        return None


def _cache_set(key, value, ttl):
    try:
        cache.set(key, value, ttl)
    except Exception:
        pass


def invalidate_catalog_caches():
    try:
        cache.delete(FILTERS_CACHE_KEY)
        cache.delete(TREE_CACHE_KEY)
        for limit in (6, 8, 12, 24):
            cache.delete(f'catalog:featured:v2:{limit}')
    except Exception:
        pass


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductListSerializer
    # SEO: публичные URL по slug; UUID тоже принимается (обратная совместимость)
    lookup_field = 'slug'
    lookup_url_kwarg = 'lookup'

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        lookup = self.kwargs.get(self.lookup_url_kwarg)
        obj = resolve_by_slug_or_uuid(queryset, lookup)
        self.check_object_permissions(self.request, obj)
        return obj

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'search', 'filters', 'featured']:
            return [AllowAny()]
        return [IsAdminUser()]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Product.objects.none()
        queryset = Product.objects.select_related('category', 'category__parent').all()
        if self.action == 'retrieve':
            queryset = queryset.prefetch_related('images')
        return filter_products_queryset(queryset, self.request)

    def perform_create(self, serializer):
        super().perform_create(serializer)
        invalidate_catalog_caches()

    def perform_update(self, serializer):
        super().perform_update(serializer)
        invalidate_catalog_caches()

    def perform_destroy(self, instance):
        super().perform_destroy(instance)
        invalidate_catalog_caches()

    @action(detail=False, methods=['get'])
    def search(self, request):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def filters(self, request):
        cached = _cache_get(FILTERS_CACHE_KEY)
        if cached is not None:
            return Response(cached)

        roots = Category.objects.filter(
            parent__isnull=True,
            is_active=True,
        ).prefetch_related('children').order_by('sort_order', 'name')
        min_price = Product.objects.filter(is_available=True).aggregate(
            min_price=models.Min('price'),
        )['min_price'] or 0
        max_price = Product.objects.filter(is_available=True).aggregate(
            max_price=models.Max('price'),
        )['max_price'] or 0
        payload = {
            'categories': CategoryTreeSerializer(roots, many=True).data,
            'price_range': {
                'min': float(min_price),
                'max': float(max_price),
            },
        }
        _cache_set(FILTERS_CACHE_KEY, payload, FILTERS_CACHE_TTL)
        return Response(payload)

    def retrieve(self, request, *args, **kwargs):
        product = self.get_object()
        related_products = ProductService.get_related_products(product)
        serializer = self.get_serializer(product)
        data = serializer.data
        data['related_products'] = ProductListSerializer(
            related_products,
            many=True,
            context=self.get_serializer_context(),
        ).data
        return Response(data)

    @action(detail=False, methods=['get'])
    def featured(self, request):
        try:
            limit = min(max(int(request.query_params.get('limit', 6)), 1), 24)
        except (TypeError, ValueError):
            limit = 6
        cache_key = f'catalog:featured:v2:{limit}'
        cached = _cache_get(cache_key)
        if cached is not None:
            return Response(cached)

        queryset = Product.objects.filter(
            is_available=True,
        ).select_related('category').order_by('-created_at')[:limit]
        serializer = self.get_serializer(queryset, many=True)
        payload = serializer.data
        _cache_set(cache_key, payload, FEATURED_CACHE_TTL)
        return Response(payload)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    lookup_field = 'slug'
    lookup_url_kwarg = 'lookup'

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        lookup = self.kwargs.get(self.lookup_url_kwarg)
        obj = resolve_by_slug_or_uuid(queryset, lookup)
        self.check_object_permissions(self.request, obj)
        return obj

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'products', 'tree', 'filters']:
            return [AllowAny()]
        return [IsAdminUser()]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CategoryDetailSerializer
        if self.action == 'tree':
            return CategoryTreeSerializer
        return CategorySerializer

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return Category.objects.none()
        queryset = Category.objects.filter(is_active=True).select_related('parent')
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)
        if self.action == 'list' and self.request.query_params.get('roots_only') == 'true':
            queryset = queryset.filter(parent__isnull=True)
        return queryset.order_by('sort_order', 'name')

    def perform_create(self, serializer):
        super().perform_create(serializer)
        invalidate_catalog_caches()

    def perform_update(self, serializer):
        super().perform_update(serializer)
        invalidate_catalog_caches()

    def perform_destroy(self, instance):
        super().perform_destroy(instance)
        invalidate_catalog_caches()

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def tree(self, request):
        cached = _cache_get(TREE_CACHE_KEY)
        if cached is not None:
            return Response(cached)
        roots = self.get_queryset().filter(parent__isnull=True).prefetch_related(
            'children',
        ).order_by('sort_order', 'name')
        serializer = CategoryTreeSerializer(roots, many=True)
        payload = serializer.data
        _cache_set(TREE_CACHE_KEY, payload, TREE_CACHE_TTL)
        return Response(payload)

    @action(detail=True, methods=['get'])
    def products(self, request, lookup=None):
        category = self.get_object()
        cat_ids = get_descendant_pks(category)
        products = Product.objects.filter(category_id__in=cat_ids).select_related('category')
        products = filter_products_queryset(products, request)
        page = self.paginate_queryset(products)
        if page is not None:
            serializer = ProductListSerializer(page, many=True, context=self.get_serializer_context())
            return self.get_paginated_response(serializer.data)
        serializer = ProductListSerializer(products, many=True, context=self.get_serializer_context())
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def filters(self, request, lookup=None):
        category = self.get_object()
        cat_ids = get_descendant_pks(category)
        products = Product.objects.filter(category_id__in=cat_ids, is_available=True)
        min_price = products.aggregate(min_price=models.Min('price'))['min_price'] or 0
        max_price = products.aggregate(max_price=models.Max('price'))['max_price'] or 0
        children = category.children.filter(is_active=True).order_by('sort_order', 'name')
        return Response({
            'category': CategoryDetailSerializer(category).data,
            'children': CategorySerializer(children, many=True).data,
            'sleep_sizes': collect_sleep_sizes(products),
            'price_range': {
                'min': float(min_price),
                'max': float(max_price),
            },
        })
