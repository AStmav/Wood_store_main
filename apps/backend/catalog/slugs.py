"""
Генерация slug для каталога.

Товары (мебель): база = «название-категория», при совпадении — суффиксы -2, -3, …
Первый товар:  divan-uglovoy-divany
Второй такой же: divan-uglovoy-divany-2
"""
from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from django.db.models import Model, QuerySet
from django.utils.text import slugify

if TYPE_CHECKING:
    from catalog.models import Category


def slug_base_from_name(name: str, *, prefix: str = 'item') -> str:
    """Базовый slug из названия (поддержка кириллицы)."""
    base = slugify(name, allow_unicode=True)
    if not base:
        base = slugify(name)
    if not base:
        base = f'{prefix}-{uuid.uuid4().hex[:8]}'
    return base


def product_slug_base(name: str, category: Category | None = None) -> str:
    """
  База для товара: название + категория.
  Одноимённые диваны в разных категориях получают разные slug.
  """
    name_part = slug_base_from_name(name, prefix='product')
    if category is not None and category.slug:
        return f'{name_part}-{category.slug}'[:200]
    return name_part[:200]


def generate_unique_slug(
    base_slug: str,
    queryset: QuerySet,
    *,
    exclude_pk: int | None = None,
    max_length: int = 200,
) -> str:
    """
    Уникальный slug: сначала base_slug, при занятости — base_slug-2, -3, …
    """
    base_slug = base_slug[:max_length].rstrip('-')

    qs = queryset
    if exclude_pk is not None:
        qs = qs.exclude(pk=exclude_pk)

    if not qs.filter(slug=base_slug).exists():
        return base_slug

    counter = 2
    while True:
        suffix = f'-{counter}'
        trimmed_base = base_slug[: max_length - len(suffix)].rstrip('-')
        candidate = f'{trimmed_base}{suffix}'
        if not qs.filter(slug=candidate).exists():
            return candidate
        counter += 1


def assign_unique_slug(
    instance: Model,
    base_slug: str,
    *,
    max_length: int = 200,
) -> str:
    """Присвоить уникальный slug экземпляру модели с полем slug."""
    manager = instance.__class__._default_manager
    return generate_unique_slug(
        base_slug,
        manager,
        exclude_pk=instance.pk,
        max_length=max_length,
    )
