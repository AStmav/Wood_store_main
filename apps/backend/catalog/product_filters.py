"""Фильтрация товаров в каталоге."""
from django.db.models import Q

from .category_tree import SLEEP_SIZE_SPEC_KEYS
from .models import Category, Product


def filter_products_queryset(queryset, request):
    """Применяет query-параметры к queryset товаров."""
    category_id = request.query_params.get('category')
    if category_id:
        try:
            category = Category.objects.get(uuid=category_id, is_active=True)
            include_children = request.query_params.get('include_subcategories', 'true').lower() == 'true'
            if include_children:
                queryset = queryset.filter(category_id__in=category.get_descendant_pks())
            else:
                queryset = queryset.filter(category=category)
        except Category.DoesNotExist:
            return Product.objects.none()

    if request.query_params.get('available_only') == 'true':
        queryset = queryset.filter(is_available=True)

    min_price = request.query_params.get('min_price')
    max_price = request.query_params.get('max_price')
    if min_price:
        queryset = queryset.filter(price__gte=min_price)
    if max_price:
        queryset = queryset.filter(price__lte=max_price)

    search = request.query_params.get('search')
    if search:
        queryset = queryset.filter(
            Q(name__icontains=search)
            | Q(description__icontains=search)
            | Q(category__name__icontains=search)
        )

    sleep_size = request.query_params.get('sleep_size')
    if sleep_size:
        size_q = Q()
        for key in SLEEP_SIZE_SPEC_KEYS:
            size_q |= Q(**{f'specifications__{key}': sleep_size})
            size_q |= Q(**{f'specifications__{key}__icontains': sleep_size})
        queryset = queryset.filter(size_q)

    ordering = request.query_params.get('ordering', '-created_at')
    if ordering not in ('name', '-name', 'price', '-price', 'created_at', '-created_at', 'rating', '-rating'):
        ordering = '-created_at'
    return queryset.order_by(ordering)
