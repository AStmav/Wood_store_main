from rest_framework import serializers
from django.utils import timezone

from pages.consent import CONSENT_REQUIRED_MESSAGE
from .models import Order, OrderItem, Delivery, Payment, Cart, CartItem, Favorite
from catalog.serializers import ProductListSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    """
    Сериализатор для элемента заказа
    """
    product = ProductListSerializer(read_only=True)
    product_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = OrderItem
        fields = ('uuid', 'product', 'product_id', 'quantity', 'price', 'total_price')
        read_only_fields = ('uuid', 'price', 'total_price')


class DeliverySerializer(serializers.ModelSerializer):
    """
    Сериализатор для доставки
    """
    class Meta:
        model = Delivery
        fields = ('uuid', 'delivery_type', 'delivery_cost', 'tracking_number', 
                 'estimated_delivery', 'delivered_at')
        read_only_fields = ('uuid', 'tracking_number', 'delivered_at')


class PaymentSerializer(serializers.ModelSerializer):
    """
    Сериализатор для оплаты
    """
    class Meta:
        model = Payment
        fields = ('uuid', 'amount', 'status', 'payment_method', 'transaction_id', 'paid_at')
        read_only_fields = ('uuid', 'status', 'transaction_id', 'paid_at')


class OrderSerializer(serializers.ModelSerializer):
    """
    Сериализатор для заказа
    """
    items = OrderItemSerializer(many=True, read_only=True)
    delivery = DeliverySerializer(read_only=True)
    payment = PaymentSerializer(read_only=True)
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Order
        fields = ('uuid', 'order_number', 'status', 'total_amount', 'address', 'phone', 'customer_name', 'email', 
                 'comment', 'items', 'delivery', 'payment', 'created_at', 'updated_at')
        read_only_fields = ('uuid', 'order_number', 'status', 'total_amount', 'created_at', 'updated_at')


class OrderCreateSerializer(serializers.ModelSerializer):
    """
    Сериализатор для создания заказа
    """
    items = OrderItemSerializer(many=True)
    delivery_type = serializers.ChoiceField(choices=Delivery.DELIVERY_TYPES, required=False, default='pickup')
    payment_method = serializers.ChoiceField(choices=Payment.PAYMENT_METHODS, required=False, default='cash')
    email = serializers.EmailField()
    address = serializers.CharField(required=False, allow_blank=True)
    comment = serializers.CharField(required=False, allow_blank=True)
    customer_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    personal_data_consent = serializers.BooleanField(write_only=True)

    class Meta:
        model = Order
        fields = (
            'address', 'phone', 'customer_name', 'email', 'comment', 'items',
            'delivery_type', 'payment_method', 'personal_data_consent',
        )

    def validate_personal_data_consent(self, value):
        if not value:
            raise serializers.ValidationError(CONSENT_REQUIRED_MESSAGE)
        return value

    def validate(self, data):
        if not data.get('phone'):
            raise serializers.ValidationError({'phone': 'Номер телефона обязателен'})
        if not data.get('email', '').strip():
            raise serializers.ValidationError({'email': 'Укажите email'})
        data.setdefault('customer_name', '')
        return data

class CartItemSerializer(serializers.ModelSerializer):
    """
    Сериализатор для элементов корзины
    """
    product = ProductListSerializer(read_only=True)
    total_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = CartItem
        fields = ['uuid', 'product', 'quantity', 'total_price']
        read_only_fields = ['uuid', 'total_price']

class CartSerializer(serializers.ModelSerializer):
    """
    Сериализатор для корзины
    """
    items = CartItemSerializer(many=True, read_only=True)
    total_amount = serializers.SerializerMethodField()
    
    def get_total_amount(self, obj):
        return obj.total_price

    class Meta:
        model = Cart
        fields = ['uuid', 'user', 'items', 'total_amount']
        read_only_fields = ['uuid', 'total_amount'] 


class FavoriteSerializer(serializers.ModelSerializer):
    """
    Сериализатор для избранных товаров
    """
    product = ProductListSerializer(read_only=True)
    product_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Favorite
        fields = ['uuid', 'product', 'product_id', 'created_at']
        read_only_fields = ['uuid', 'created_at']


class FavoriteListSerializer(serializers.ModelSerializer):
    """
    Сериализатор для списка избранных товаров
    """
    product = ProductListSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = ['uuid', 'product', 'created_at']
        read_only_fields = ['uuid', 'created_at']

