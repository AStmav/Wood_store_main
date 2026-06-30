from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from catalog.models import Category, Product
from orders.models import Order
from pages.consent import CONSENT_REQUIRED_MESSAGE, is_personal_data_consent_given
from pages.models import Page
from users.models import User


class PersonalDataConsentTests(TestCase):
    def test_consent_truthy_values(self):
        self.assertTrue(is_personal_data_consent_given({'personal_data_consent': '1'}))
        self.assertTrue(is_personal_data_consent_given({'personal_data_consent': True}))
        self.assertTrue(is_personal_data_consent_given({'personal_data_consent': 'on'}))

    def test_consent_missing_or_false(self):
        self.assertFalse(is_personal_data_consent_given({}))
        self.assertFalse(is_personal_data_consent_given({'personal_data_consent': False}))
        self.assertFalse(is_personal_data_consent_given({'personal_data_consent': '0'}))


class PageApiTests(APITestCase):
    def setUp(self):
        self.page = Page.objects.get(slug='personal-data')
        self.page.content = '<p>Тестовое соглашение</p>'
        self.page.save(update_fields=['content'])

    def test_get_page_by_slug(self):
        response = self.client.get('/api/pages/slug/personal-data/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], self.page.title)
        self.assertIn('Тестовое соглашение', response.data['content'])

    def test_site_config(self):
        response = self.client.get('/api/pages/site_config/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['personal_data_policy_slug'], 'personal-data')


class OrderConsentApiTests(APITestCase):
    def setUp(self):
        category = Category.objects.create(name='Тест', slug='test', description='')
        self.product = Product.objects.create(
            name='Кровать',
            slug='krovat-test',
            price='10000.00',
            category=category,
            stock_quantity=5,
            is_available=True,
        )

    def _order_payload(self, with_consent=True):
        payload = {
            'phone': '+79141023232',
            'items': [{'product_id': str(self.product.uuid), 'quantity': 1}],
            'delivery_type': 'pickup',
            'payment_method': 'cash',
        }
        if with_consent:
            payload['personal_data_consent'] = True
        return payload

    def test_order_requires_personal_data_consent(self):
        response = self.client.post('/api/orders/orders/', self._order_payload(with_consent=False), format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('personal_data_consent', response.data)
        self.assertEqual(Order.objects.count(), 0)

    def test_order_saves_consent_timestamp(self):
        response = self.client.post('/api/orders/orders/', self._order_payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        order = Order.objects.get()
        self.assertTrue(order.personal_data_consent)
        self.assertIsNotNone(order.consent_at)


class RegistrationConsentApiTests(APITestCase):
    def test_registration_requires_personal_data_consent(self):
        response = self.client.post('/api/users/', {
            'email': 'user@example.com',
            'password': 'StrongPass123!',
            'password2': 'StrongPass123!',
            'first_name': 'Иван',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('personal_data_consent', response.data)
        self.assertEqual(User.objects.count(), 0)

    def test_registration_saves_consent_timestamp(self):
        response = self.client.post('/api/users/', {
            'email': 'user@example.com',
            'password': 'StrongPass123!',
            'password2': 'StrongPass123!',
            'first_name': 'Иван',
            'personal_data_consent': True,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(email='user@example.com')
        self.assertIsNotNone(user.personal_data_consent_at)
