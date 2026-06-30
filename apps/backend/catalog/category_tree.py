"""Утилиты для иерархии категорий."""
from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from catalog.models import Category

SLEEP_SIZE_SPEC_KEYS = (
    'Размер спального места',
    'Размеры',
    'Размер кровати',
)


def get_descendant_pks(category: Category) -> list[int]:
    """ID категории и всех активных потомков."""
    pks = [category.pk]
    for child in category.children.filter(is_active=True).order_by('sort_order', 'name'):
        pks.extend(get_descendant_pks(child))
    return pks


def collect_sleep_sizes(products_qs) -> list[dict]:
    """Уникальные размеры спального места из характеристик товаров."""
    sizes: dict[str, int] = {}
    for product in products_qs.only('specifications'):
        specs = product.specifications or {}
        for key in SLEEP_SIZE_SPEC_KEYS:
            value = specs.get(key)
            if not value:
                continue
            normalized = str(value).strip()
            if normalized:
                sizes[normalized] = sizes.get(normalized, 0) + 1
            break
    return [{'value': value, 'count': count} for value, count in sorted(sizes.items())]
