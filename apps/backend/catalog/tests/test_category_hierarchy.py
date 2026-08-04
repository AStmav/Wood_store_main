from django.test import TestCase
from rest_framework.test import APIClient

from catalog.models import Category, Product


class CategoryHierarchyApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.root = Category.objects.create(name='Кровати и матрасы', description='root')
        self.child = Category.objects.create(
            name='Кровати',
            description='child',
            parent=self.root,
        )
        self.other = Category.objects.create(
            name='Матрасы',
            description='other',
            parent=self.root,
        )
        Product.objects.create(
            name='Кровать тест',
            description='',
            price='10000',
            category=self.child,
            specifications={'Размер спального места': '160×200 см'},
        )
        Product.objects.create(
            name='Матрас тест',
            description='',
            price='5000',
            category=self.other,
            specifications={'Размер спального места': '90×200 см'},
        )

    def test_category_tree_endpoint(self):
        response = self.client.get('/api/catalog/categories/tree/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(len(response.data[0]['children']), 2)

    def test_root_category_includes_child_products(self):
        response = self.client.get(f'/api/catalog/categories/{self.root.uuid}/products/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['results']), 2)

    def test_category_filters_sleep_sizes(self):
        response = self.client.get(f'/api/catalog/categories/{self.root.uuid}/filters/')
        self.assertEqual(response.status_code, 200)
        values = {item['value'] for item in response.data['sleep_sizes']}
        self.assertIn('160×200 см', values)
        self.assertIn('90×200 см', values)

    def test_category_lookup_by_slug(self):
        response = self.client.get(f'/api/catalog/categories/{self.root.slug}/products/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['results']), 2)
