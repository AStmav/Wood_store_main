from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny
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


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductListSerializer
    lookup_field = 'uuid'

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
        roots = Category.objects.filter(
            parent__isnull=True,
            is_active=True,
        ).order_by('sort_order', 'name')
        min_price = Product.objects.filter(is_available=True).aggregate(
            min_price=models.Min('price'),
        )['min_price'] or 0
        max_price = Product.objects.filter(is_available=True).aggregate(
            max_price=models.Max('price'),
        )['max_price'] or 0
        return Response({
            'categories': CategoryTreeSerializer(roots, many=True).data,
            'price_range': {
                'min': float(min_price),
                'max': float(max_price),
            },
        })

    def retrieve(self, request, *args, **kwargs):
        product = self.get_object()
        related_products = ProductService.get_related_products(product)
        serializer = self.get_serializer(product)
        data = serializer.data
        data['related_products'] = ProductListSerializer(related_products, many=True).data
        return Response(data)

    @action(detail=False, methods=['get'])
    def featured(self, request):
        limit = int(request.query_params.get('limit', 6))
        queryset = Product.objects.filter(
            is_available=True,
        ).select_related('category').order_by('-created_at')[:limit]
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    lookup_field = 'uuid'

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

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def tree(self, request):
        roots = self.get_queryset().filter(parent__isnull=True).order_by('sort_order', 'name')
        serializer = CategoryTreeSerializer(roots, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def products(self, request, uuid=None):
        category = self.get_object()
        cat_ids = get_descendant_pks(category)
        products = Product.objects.filter(category_id__in=cat_ids).select_related('category')
        products = filter_products_queryset(products, request)
        page = self.paginate_queryset(products)
        if page is not None:
            serializer = ProductListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def filters(self, request, uuid=None):
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
