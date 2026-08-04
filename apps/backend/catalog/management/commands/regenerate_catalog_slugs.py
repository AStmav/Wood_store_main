"""
Перегенерировать slug категорий и товаров в латинице (ASCII).

Использование:
  python manage.py regenerate_catalog_slugs
  python manage.py regenerate_catalog_slugs --dry-run
"""
from django.core.management.base import BaseCommand
from django.db import transaction

from catalog.models import Category, Product
from catalog.slugs import assign_unique_slug, product_slug_base, slug_base_from_name


class Command(BaseCommand):
    help = 'Перегенерировать slug категорий и товаров в латинице'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Только показать изменения, без записи в БД',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        dry_run = options['dry_run']
        changed_categories = 0
        changed_products = 0

        # Сначала категории — от них зависят product slug
        for category in Category.objects.order_by('id'):
            new_slug = assign_unique_slug(
                category,
                slug_base_from_name(category.name, prefix='category'),
                max_length=100,
            )
            if new_slug != category.slug:
                self.stdout.write(f'category {category.pk}: {category.slug!r} -> {new_slug!r}')
                changed_categories += 1
                if not dry_run:
                    Category.objects.filter(pk=category.pk).update(slug=new_slug)
                    category.slug = new_slug

        for product in Product.objects.select_related('category').order_by('id'):
            new_slug = assign_unique_slug(
                product,
                product_slug_base(product.name, product.category),
                max_length=200,
            )
            if new_slug != product.slug:
                self.stdout.write(f'product {product.pk}: {product.slug!r} -> {new_slug!r}')
                changed_products += 1
                if not dry_run:
                    Product.objects.filter(pk=product.pk).update(slug=new_slug)

        if dry_run:
            transaction.set_rollback(True)
            self.stdout.write(self.style.WARNING(
                f'Dry-run: categories={changed_categories}, products={changed_products} (не сохранено)'
            ))
        else:
            self.stdout.write(self.style.SUCCESS(
                f'Готово: categories={changed_categories}, products={changed_products}'
            ))
