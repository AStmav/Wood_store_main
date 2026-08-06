from django.core import mail
from django.test import TestCase, override_settings

from catalog.models import Category, Product
from notifications.services import OrderEmailService, notify_manager_about_order
from orders.models import Order, OrderItem


@override_settings(
    EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
    EMAIL_HOST='smtp.example.com',
    ORDER_NOTIFY_EMAIL='manager@example.com',
    DEFAULT_FROM_EMAIL='shop@example.com',
    SITE_URL='https://skazkindomykt.ru',
    TELEGRAM_BOT_TOKEN='',
    TELEGRAM_CHANNEL_ID='',
)
class OrderEmailNotificationTests(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name='Тест', description='')
        self.product = Product.objects.create(
            name='Стол тест',
            price='1000.00',
            category=self.category,
        )
        self.order = Order.objects.create(
            order_number='ORD-TEST-1',
            phone='+79990001122',
            email='client@example.com',
            customer_name='Иван',
            comment='Нужен расчёт',
            personal_data_consent=True,
            total_amount='1000.00',
        )
        OrderItem.objects.create(
            order=self.order,
            product=self.product,
            quantity=1,
            price='1000.00',
        )

    def test_email_service_sends_mail(self):
        ok = OrderEmailService().send_order_notification(self.order)
        self.assertTrue(ok)
        self.assertEqual(len(mail.outbox), 1)
        msg = mail.outbox[0]
        self.assertIn('ORD-TEST-1', msg.subject)
        self.assertIn('+79990001122', msg.body)
        self.assertIn('Стол тест', msg.body)
        self.assertIn('/admin/orders/order/', msg.body)
        self.assertEqual(msg.to, ['manager@example.com'])

    def test_notify_sets_email_flag(self):
        result = notify_manager_about_order(self.order)
        self.assertTrue(result['email'])
        self.order.refresh_from_db()
        self.assertTrue(self.order.email_notification_sent)
