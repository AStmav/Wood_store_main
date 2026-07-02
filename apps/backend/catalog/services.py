from typing import List, Optional, Dict, Any
from django.db.models import Q, Prefetch
from django.core.paginator import Paginator
from .models import Product, Category

class ProductService:

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
        queryset = Product.objects.select_related('category').filter(is_available=True)

        if category_id:
            queryset = queryset.filter(category_id=category_id)

        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) |
                Q(description__icontains=search_query)
            )

        if min_price is not None:
            queryset = queryset.filter(price__gte=min_price)
        if max_price is not None:
            queryset = queryset.filter(price__lte=max_price)

        if sort_by:
            if sort_by == 'price_asc':
                queryset = queryset.order_by('price')
            elif sort_by == 'price_desc':
                queryset = queryset.order_by('-price')
            elif sort_by == 'name_asc':
                queryset = queryset.order_by('name')
            elif sort_by == 'name_desc':
                queryset = queryset.order_by('-name')

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
        try:
            return Product.objects.select_related('category').get(id=product_id)
        except Product.DoesNotExist:
            return None

    @staticmethod
    def get_related_products(product: Product, limit: int = 4) -> List[Product]:
        return Product.objects.filter(
            category=product.category,
            is_available=True,
        ).exclude(
            id=product.id
        ).order_by('-created_at')[:limit]

class CategoryService:
    @staticmethod
    def get_category_list() -> List[Category]:
        return Category.objects.all()

    @staticmethod
    def get_category_detail(category_id: int) -> Optional[Category]:
        try:
            return Category.objects.prefetch_related(
                Prefetch(
                    'products',
                    queryset=Product.objects.filter(is_available=True).order_by('-created_at')
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
        try:
            category = Category.objects.get(id=category_id)
            products = category.products.filter(is_available=True)

            if sort_by:
                if sort_by == 'price_asc':
                    products = products.order_by('price')
                elif sort_by == 'price_desc':
                    products = products.order_by('-price')
                elif sort_by == 'name_asc':
                    products = products.order_by('name')
                elif sort_by == 'name_desc':
                    products = products.order_by('-name')

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
