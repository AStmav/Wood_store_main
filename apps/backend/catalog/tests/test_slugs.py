from django.test import TestCase

from catalog.models import Category, Product
from catalog.slugs import generate_unique_slug, product_slug_base


class SlugGenerationTests(TestCase):
    def setUp(self):
        self.category_divany = Category.objects.create(
            name='Диваны',
            description='',
        )
        self.category_krovati = Category.objects.create(
            name='Кровати',
            description='',
        )

    def test_product_slug_includes_category(self):
        base = product_slug_base('Диван угловой', self.category_divany)
        self.assertTrue(base.endswith(f'-{self.category_divany.slug}'))

    def test_same_name_different_categories_get_different_slugs(self):
        p1 = Product.objects.create(
            name='Диван угловой',
            price='10000',
            category=self.category_divany,
        )
        p2 = Product.objects.create(
            name='Диван угловой',
            price='12000',
            category=self.category_krovati,
        )
        self.assertNotEqual(p1.slug, p2.slug)

    def test_duplicate_name_same_category_gets_suffix_2(self):
        p1 = Product.objects.create(
            name='Диван прямой',
            price='10000',
            category=self.category_divany,
        )
        p2 = Product.objects.create(
            name='Диван прямой',
            price='11000',
            category=self.category_divany,
        )
        p3 = Product.objects.create(
            name='Диван прямой',
            price='12000',
            category=self.category_divany,
        )
        self.assertFalse(p1.slug.endswith('-2'))
        self.assertTrue(p2.slug.endswith('-2'))
        self.assertTrue(p3.slug.endswith('-3'))

    def test_generate_unique_slug_skips_one(self):
        Product.objects.create(
            name='Стол',
            price='5000',
            category=self.category_divany,
        )
        taken = Product.objects.first().slug
        next_slug = generate_unique_slug(
            taken,
            Product.objects,
            exclude_pk=None,
        )
        self.assertTrue(next_slug.endswith('-2'))
        self.assertNotEqual(next_slug, f'{taken}-1')
