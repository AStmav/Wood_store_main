from typing import List, Optional, Dict, Any
from django.db.models import Q, Prefetch
from django.core.paginator import Paginator
from .models import Product, Category

class ProductService:

    @staticmethod
    def check_product_available(product_uuid: str) -> bool:
        """
        Проверка доступности товара
        """
        try:
            product = Product.objects.get(uuid=product_uuid)
            return product.is_available and product.stock_quantity > 0
        except Product.DoesNotExist:
            return False

    @staticmethod
    def get_available_quantity(product_uuid: str) -> int:
        """
        Получение доступного количества товара
        """
        try:
            product = Product.objects.get(uuid=product_uuid)
            return product.stock_quantity if product.is_available else 0
        except Product.DoesNotExist:
            return 0
    @staticmethod
    def get_product_list(
        category_id: Optional[int] = None,
        search_query: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        sort_by: Optional[str] = None,
        page: int = 1,
        page_size: int = 10
    ) -> Dict[str, Any]:
        """
        Получение списка товаров с фильтрацией, поиском и пагинацией
        """
        queryset = Product.objects.select_related('category').all()

        # Фильтрация по категории
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        # Поиск по названию и описанию
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) |
                Q(description__icontains=search_query)
            )

        # Фильтрация по цене
        if min_price is not None:
            queryset = queryset.filter(price__gte=min_price)
        if max_price is not None:
            queryset = queryset.filter(price__lte=max_price)

        # Сортировка
        if sort_by:
            if sort_by == 'price_asc':
                queryset = queryset.order_by('price')
            elif sort_by == 'price_desc':
                queryset = queryset.order_by('-price')
            elif sort_by == 'name_asc':
                queryset = queryset.order_by('name')
            elif sort_by == 'name_desc':
                queryset = queryset.order_by('-name')
            elif sort_by == 'rating':
                queryset = queryset.order_by('-rating')

        # Пагинация
        paginator = Paginator(queryset, page_size)
        products = paginator.get_page(page)

        return {
            'products': products,
            'total_pages': paginator.num_pages,
            'current_page': page,
            'total_items': paginator.count
        }

    @staticmethod
    def get_product_detail(product_id: int) -> Optional[Product]:
        """
        Получение детальной информации о товаре
        """
        try:
            return Product.objects.select_related('category').get(id=product_id)
        except Product.DoesNotExist:
            return None

    @staticmethod
    def get_related_products(product: Product, limit: int = 4) -> List[Product]:
        """
        Получение похожих товаров из той же категории
        """
        return Product.objects.filter(
            category=product.category
        ).exclude(
            id=product.id
        ).order_by('-rating')[:limit]

class CategoryService:
    @staticmethod
    def get_category_list() -> List[Category]:
        """
        Получение списка всех категорий
        """
        return Category.objects.all()

    @staticmethod
    def get_category_detail(category_id: int) -> Optional[Category]:
        """
        Получение детальной информации о категории
        """
        try:
            return Category.objects.prefetch_related(
                Prefetch(
                    'products',
                    queryset=Product.objects.order_by('-rating')
                )
            ).get(id=category_id)
        except Category.DoesNotExist:
            return None

    @staticmethod
    def get_category_products(
        category_id: int,
        page: int = 1,
        page_size: int = 10,
        sort_by: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Получение товаров категории с пагинацией и сортировкой
        """
        try:
            category = Category.objects.get(id=category_id)
            products = category.products.all()

            # Сортировка
            if sort_by:
                if sort_by == 'price_asc':
                    products = products.order_by('price')
                elif sort_by == 'price_desc':
                    products = products.order_by('-price')
                elif sort_by == 'name_asc':
                    products = products.order_by('name')
                elif sort_by == 'name_desc':
                    products = products.order_by('-name')
                elif sort_by == 'rating':
                    products = products.order_by('-rating')

            # Пагинация
            paginator = Paginator(products, page_size)
            products_page = paginator.get_page(page)

            return {
                'category': category,
                'products': products_page,
                'total_pages': paginator.num_pages,
                'current_page': page,
                'total_items': paginator.count
            }
        except Category.DoesNotExist:
            return None
