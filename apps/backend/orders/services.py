from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from .models import Order, OrderItem, Delivery, Payment, Cart, CartItem
from catalog.models import Product
from catalog.availability import AvailabilityStatus
from catalog.services import ProductService

class OrderService:
    @staticmethod
    def generate_order_number():
        """
        Генерация уникального номера заказа в формате ORD-YYYY-XXXX
        """
        current_year = timezone.now().year
        
        # Получаем последний заказ за текущий год
        last_order = Order.objects.filter(
            order_number__startswith=f'ORD-{current_year}-'
        ).order_by('-order_number').first()
        
        if last_order:
            # Извлекаем номер из последнего заказа
            try:
                last_number = int(last_order.order_number.split('-')[-1])
                new_number = last_number + 1
            except (ValueError, IndexError):
                new_number = 1
        else:
            new_number = 1
        
        # Форматируем номер с ведущими нулями
        return f'ORD-{current_year}-{new_number:04d}'

    @staticmethod
    @transaction.atomic
    def create_order(user, validated_data):
        """
        Создание нового заказа
        """
        items_data = validated_data.pop('items')
        delivery_type = validated_data.pop('delivery_type', 'pickup')
        payment_method = validated_data.pop('payment_method', 'cash')
        validated_data.pop('personal_data_consent', None)

        phone = validated_data.get('phone')
        if not phone:
            raise ValueError('Не указан номер телефона')

        if user and not validated_data.get('email'):
            validated_data['email'] = user.email
        validated_data.setdefault('email', '')
        validated_data.setdefault('address', '')
        validated_data.setdefault('comment', '')
        
        # Генерируем номер заказа
        order_number = OrderService.generate_order_number()
        
        # Создаем заказ
        order = Order.objects.create(
            user=user if user and getattr(user, 'is_authenticated', False) else None,
            order_number=order_number,
            personal_data_consent=True,
            consent_at=timezone.now(),
            **validated_data
        )
        
        # Создаем элементы заказа
        total_amount = Decimal('0')
        for item_data in items_data:
            product_id = item_data.pop('product_id')
            product = Product.objects.get(uuid=product_id)
            if not product.is_available:
                raise ValueError(f'Товар «{product.name}» недоступен')
            if product.availability_status != AvailabilityStatus.IN_STOCK:
                raise ValueError(f'Товар «{product.name}» в пути и недоступен для заказа')
            item = OrderItem.objects.create(
                order=order,
                product=product,
                price=product.price,
                **item_data
            )
            total_amount += item.total_price
        
        # Обновляем общую сумму заказа
        order.total_amount = total_amount
        order.save()
        
        # Создаем доставку
        delivery_cost = OrderService.calculate_delivery_cost(delivery_type)
        Delivery.objects.create(
            order=order,
            delivery_type=delivery_type,
            delivery_cost=delivery_cost
        )
        
        # Создаем оплату
        Payment.objects.create(
            order=order,
            amount=total_amount + delivery_cost,
            payment_method=payment_method
        )
        
        return order

    @staticmethod
    def calculate_delivery_cost(delivery_type):
        """
        Расчет стоимости доставки
        """
        if delivery_type == 'standard':
            return Decimal('500')
        return Decimal('0')

    @staticmethod
    @transaction.atomic
    def cancel_order(order):
        """
        Отмена заказа
        """
        if order.status != "new":
            raise ValueError("Заказ нельзя отменить в текущем статусе")
        
        order.status = 'cancelled'
        order.save()
        
        # Отменяем оплату
        payment = order.payment
        payment.status = 'refunded'
        payment.save()
        
        # Автоматически мягко удаляем отмененный заказ через 30 дней
        # Это можно настроить через планировщик задач
        return order
    
    @staticmethod
    @transaction.atomic
    def soft_delete_cancelled_order(order):
        """
        Мягкое удаление отмененного заказа
        """
        if order.status != 'cancelled':
            raise ValueError("Можно удалять только отмененные заказы")
        
        order.soft_delete()
        return order
    
    @staticmethod
    def cleanup_old_cancelled_orders(days=30):
        """
        Автоматическое мягкое удаление старых отмененных заказов
        """
        from django.utils import timezone
        from datetime import timedelta
        
        cutoff_date = timezone.now() - timedelta(days=days)
        old_cancelled_orders = Order.objects.filter(
            status='cancelled',
            is_deleted=False,
            updated_at__lt=cutoff_date
        )
        
        deleted_count = 0
        for order in old_cancelled_orders:
            order.soft_delete()
            deleted_count += 1
        
        return deleted_count

    @staticmethod
    @transaction.atomic
    def confirm_payment(order):
        """
        Подтверждение оплаты заказа
        """
        payment = order.payment
        
        if payment.status != 'pending':
            raise ValueError("Заказ уже оплачен или отменен")
        
        payment.status = 'completed'
        payment.save()
        
        order.status = 'processing'
        order.save()
        
        return order


class CartService:
    @staticmethod
    def get_or_create_cart(session_id=None, user=None):
        """
        Получение или создание корзины
        """
        if user:
            # Для авторизованных пользователей используем только user
            cart, created = Cart.objects.get_or_create(
                user=user,
                defaults={'session_id': ''}
            )
        else:
            # Для неавторизованных пользователей используем session_id
            cart, created = Cart.objects.get_or_create(
                session_id=session_id or '',
                defaults={'user': None}
            )
        return cart, created

    @staticmethod
    @transaction.atomic
    def add_to_cart(cart, product_uuid, quantity=1):
        """
        Добавление товара в корзину
        """
        product = Product.objects.get(uuid=product_uuid)
        if not product.is_available:
            raise ValueError("Товар недоступен")
        if product.availability_status != AvailabilityStatus.IN_STOCK:
            raise ValueError("Товар в пути и недоступен для заказа")

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )
        
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        
        return cart_item

    @staticmethod
    @transaction.atomic
    def update_cart_item(cart_item, quantity):
        """
        Обновление количества товара в корзине
        """
        if quantity <= 0:
            cart_item.delete()
            return None
        
        cart_item.quantity = quantity
        cart_item.save()
        return cart_item

    @staticmethod
    @transaction.atomic
    def remove_from_cart(cart_item):
        """
        Удаление товара из корзины
        """
        cart_item.delete()

    @staticmethod
    def clear_cart(cart):
        """
        Очистка корзины
        """
        cart.items.all().delete()

    @staticmethod
    def get_cart_total(cart):
        """
        Получение общей стоимости корзины
        """
        return sum(item.total_price for item in cart.items.all()) 