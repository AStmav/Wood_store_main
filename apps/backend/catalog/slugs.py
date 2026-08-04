"""
Генерация slug для каталога.

Товары (мебель): база = «название-категория» в латинице, при совпадении — суффиксы -2, -3, …
Первый товар:  divan-uglovoy-divany
Второй такой же: divan-uglovoy-divany-2
"""
from __future__ import annotations

import re
import uuid
from typing import TYPE_CHECKING

from django.db.models import Model, QuerySet
from django.utils.text import slugify

if TYPE_CHECKING:
    from catalog.models import Category

# Практичная транслитерация RU → латиница для SEO URL
_CYRILLIC_MAP = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
}


def transliterate_to_latin(value: str) -> str:
    """Кириллица → латиница; прочий текст оставляем как есть."""
    if not value:
        return ''
    out = []
    for char in value:
        lower = char.lower()
        if lower in _CYRILLIC_MAP:
            mapped = _CYRILLIC_MAP[lower]
            out.append(mapped)
        else:
            out.append(char)
    return ''.join(out)


def slug_base_from_name(name: str, *, prefix: str = 'item') -> str:
    """Базовый ASCII-slug из названия (через транслит кириллицы)."""
    latin = transliterate_to_latin(name)
    base = slugify(latin, allow_unicode=False)
    if not base:
        base = slugify(name, allow_unicode=False)
    if not base:
        # на случай пустого результата после очистки
        base = re.sub(r'[^a-z0-9]+', '-', latin.lower()).strip('-')
    if not base:
        base = f'{prefix}-{uuid.uuid4().hex[:8]}'
    return base


def product_slug_base(name: str, category: Category | None = None) -> str:
    """
    База для товара: название + категория (оба в латинице).
    Одноимённые товары в разных категориях получают разные slug.
    """
    name_part = slug_base_from_name(name, prefix='product')
    if category is not None and category.slug:
        cat_slug = category.slug
        # Старые записи могли сохранить кириллический slug категории
        if not cat_slug.isascii():
            cat_slug = slug_base_from_name(category.name or cat_slug, prefix='category')
        return f'{name_part}-{cat_slug}'[:200]
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
    base_slug = slugify(base_slug, allow_unicode=False) or base_slug
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
