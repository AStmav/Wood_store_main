from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.db import models
from .models import Product, Category
from .serializers import (
    ProductListSerializer, 
    ProductDetailSerializer,
    CategorySerializer
)
from .services import ProductService, CategoryService

class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet для управления товарами
    """
    queryset = Product.objects.all()
    serializer_class = ProductListSerializer
    lookup_field = 'uuid'

    def get_permissions(self):
        """
        GET запросы доступны всем, остальные только админам
        """
        if self.action in ['list', 'retrieve', 'search', 'filters', 'bestsellers']:
            return [AllowAny()]
        return [IsAdminUser()]

    def get_serializer_class(self):
        """
        Возвращает сериализатор в зависимости от действия
        """
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer
    
    def get_queryset(self):
        """
        Возвращает queryset с фильтрацией и поиском
        """
        if getattr(self, 'swagger_fake_view', False):
            return Product.objects.none()
        
        queryset = Product.objects.select_related('category').all()
        
        # Фильтрация по категории
        category_id = self.request.query_params.get('category', None)
        if category_id:
            queryset = queryset.filter(category__uuid=category_id)
        
        # Фильтрация по доступности
        available_only = self.request.query_params.get('available_only', None)
        if available_only == 'true':
            queryset = queryset.filter(is_available=True)
        
        # Фильтрация по цене
        min_price = self.request.query_params.get('min_price', None)
        max_price = self.request.query_params.get('max_price', None)
        
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        # Поиск по названию и описанию
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(category__name__icontains=search)
            )
        
        # Сортировка
        ordering = self.request.query_params.get('ordering', '-created_at')
        if ordering not in ['name', '-name', 'price', '-price', 'created_at', '-created_at']:
            ordering = '-created_at'
        queryset = queryset.order_by(ordering)
        
        return queryset

    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Расширенный поиск товаров
        """
        queryset = self.get_queryset()
        
        # Пагинация
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def filters(self, request):
        """
        Получение доступных фильтров для поиска
        """
        categories = Category.objects.all()
        min_price = Product.objects.filter(is_available=True).aggregate(
            min_price=models.Min('price')
        )['min_price'] or 0
        max_price = Product.objects.filter(is_available=True).aggregate(
            max_price=models.Max('price')
        )['max_price'] or 0
        
        return Response({
            'categories': CategorySerializer(categories, many=True).data,
            'price_range': {
                'min': float(min_price),
                'max': float(max_price)
            }
        })

    def retrieve(self, request, *args, **kwargs):
        """
        Возвращает детальную информацию о товаре
        """
        product = self.get_object()
        related_products = ProductService.get_related_products(product)
        serializer = self.get_serializer(product)
        data = serializer.data
        data['related_products'] = ProductListSerializer(
            related_products, 
            many=True
        ).data
        
        return Response(data)
    

    @action(detail=False, methods=['post'])
    def rate(self, request):
        """
        Оценка товара
        """
        product_id = request.data.get('product_id')
        rating = request.data.get('rating')
        
        try:
            product = ProductService.rate_product(product_id, rating)
            return Response(
                ProductDetailSerializer(product).data,
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def bestsellers(self, request):
        """
        Получение товаров-хитов продаж на основе рейтинга
        """
        # Параметры запроса
        min_rating = float(request.query_params.get('min_rating', 4.0))
        limit = int(request.query_params.get('limit', 6))
        
        # Получаем товары с рейтингом >= min_rating, доступные для заказа
        queryset = Product.objects.filter(
            rating__gte=min_rating,
            is_available=True,
            stock_quantity__gt=0
        ).select_related('category').order_by('-rating', '-created_at')[:limit]
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet для работы с категориями
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'uuid'

    def get_permissions(self):
        """
        GET запросы доступны всем, остальные только админам
        """
        if self.action in ['list', 'retrieve', 'products']:
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        """
        Возвращает queryset с поиском
        """
        if getattr(self, 'swagger_fake_view', False):
            return Category.objects.none()
        
        queryset = Category.objects.all()
        
        # Поиск по названию
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        return queryset.order_by('name')

    @action(detail=True, methods=['get'])
    def products(self, request, uuid=None):
        """
        Получение товаров категории
        """
        category = self.get_object()
        products = category.products.all()
        
        page = self.paginate_queryset(products)
        if page is not None:
            serializer = ProductListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)
