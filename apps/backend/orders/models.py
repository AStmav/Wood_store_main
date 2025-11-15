from django.db import models
from django.conf import settings
from django.utils import timezone
from catalog.models import Product, BaseModel
from users.models import User

class Cart(BaseModel):
    """Корзина пользователя"""
    session_id = models.CharField(max_length=100, null=True, blank=True, verbose_name='ID сессии')
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        verbose_name='Пользователь'
    )

    class Meta:
        verbose_name = 'Корзина'
        verbose_name_plural = 'Корзины'

    def __str__(self):
        if self.user:
            return f'Корзина пользователя {self.user.email}'
        return f'Корзина сессии {self.session_id}'

    @property
    def total_price(self):
        return sum(item.total_price for item in self.items.all())

class CartItem(BaseModel):
    """Элемент корзины"""
    cart = models.ForeignKey(
        Cart, 
        on_delete=models.CASCADE, 
        related_name='items', 
        verbose_name='Корзина'
    )
    product = models.ForeignKey(
        Product, 
        on_delete=models.CASCADE, 
        verbose_name='Товар'
    )
    quantity = models.PositiveIntegerField(default=1, verbose_name='Количество')

    class Meta:
        verbose_name = 'Элемент корзины'
        verbose_name_plural = 'Элементы корзины'
        unique_together = ('cart', 'product')

    def __str__(self):
        return f'{self.product.name} x {self.quantity}'

    @property
    def total_price(self):
        return self.product.price * self.quantity

class Order(BaseModel):
    """
    Модель заказа
    """
    STATUS_CHOICES = [
        ('new', 'Новый'),
        ('processing', 'В обработке'),
        ('shipped', 'Отправлен'),
        ('delivered', 'Доставлен'),
        ('cancelled', 'Отменен'),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='orders', verbose_name='Пользователь', null=True, blank=True)
    order_number = models.CharField(max_length=20, blank=True, verbose_name='Номер заказа')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new', verbose_name='Статус')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name='Общая сумма')
    address = models.TextField(blank=True, null=True, verbose_name='Адрес доставки')
    phone = models.CharField(max_length=20, verbose_name='Телефон')
    email = models.EmailField(verbose_name='Email', blank=True)
    comment = models.TextField(blank=True, verbose_name='Комментарий к заказу')
    is_deleted = models.BooleanField(default=False, verbose_name='Удален')
    telegram_notification_sent = models.BooleanField(default=False, verbose_name="Telegram уведомления об отправке")

    class Meta:
        verbose_name = 'Заказ'
        verbose_name_plural = 'Заказы'
        ordering = ['-created_at']

    def __str__(self):
        owner = self.user.email if self.user else self.phone
        return f'Заказ {self.order_number} ({owner})'

    def calculate_total(self):
        """Расчет общей суммы заказа"""
        return sum(item.total_price for item in self.items.all())
    
    def soft_delete(self):
        """Мягкое удаление заказа"""
        self.is_deleted = True
        self.save()
    
    def restore(self):
        """Восстановление заказа"""
        self.is_deleted = False
        self.save()
    
    @classmethod
    def active_orders(cls):
        """Получение активных (не удаленных) заказов"""
        return cls.objects.filter(is_deleted=False)
    
    def get_status_color(self):
        """Получение цвета для статуса заказа"""
        colors = {
            'new': '#28a745',        # Зеленый - новый
            'processing': '#ffc107',  # Желтый - в обработке
            'shipped': '#17a2b8',     # Голубой - отправлен
            'delivered': '#007bff',   # Синий - доставлен
            'cancelled': '#dc3545',   # Красный - отменен
        }
        return colors.get(self.status, '#6c757d')  # Серый по умолчанию
    
    def get_status_display_with_color(self):
        """Получение отображения статуса с цветом для админки"""
        color = self.get_status_color()
        return f'<span style="color: {color}; font-weight: bold;">{self.get_status_display()}</span>'

class OrderItem(BaseModel):
    """
    Модель элемента заказа
    """
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items', verbose_name='Заказ')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, verbose_name='Товар')
    quantity = models.PositiveIntegerField(default=1, verbose_name='Количество')
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Цена за единицу')
    total_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Общая стоимость')

    class Meta:
        verbose_name = 'Элемент заказа'
        verbose_name_plural = 'Элементы заказа'

    def __str__(self):
        return f'{self.product.name} x {self.quantity}'

    def save(self, *args, **kwargs):
        """Автоматический расчет общей стоимости при сохранении"""
        self.total_price = self.price * self.quantity
        super().save(*args, **kwargs)

class Delivery(BaseModel):
    """
    Модель доставки
    """
    DELIVERY_TYPES = [
        ('standard', 'Стандартная доставка'),
        ('pickup', 'Самовывоз'),
    ]

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='delivery', verbose_name='Заказ')
    delivery_type = models.CharField(max_length=20, choices=DELIVERY_TYPES, verbose_name='Тип доставки')
    delivery_cost = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Стоимость доставки')
    tracking_number = models.CharField(max_length=50, blank=True, verbose_name='Номер отслеживания')
    estimated_delivery = models.DateField(null=True, blank=True, verbose_name='Предполагаемая дата доставки')
    delivered_at = models.DateTimeField(null=True, blank=True, verbose_name='Дата доставки')

    class Meta:
        verbose_name = 'Доставка'
        verbose_name_plural = 'Доставки'

    def __str__(self):
        return f'Доставка заказа #{self.order.id}'

class Payment(BaseModel):
    """
    Модель оплаты
    """
    PAYMENT_STATUSES = [
        ('pending', 'Ожидает оплаты'),
        ('processing', 'В обработке'),
        ('completed', 'Оплачено'),
        ('failed', 'Ошибка оплаты'),
        ('refunded', 'Возвращено'),
    ]

    PAYMENT_METHODS = [
        ('card', 'Банковская карта'),
        ('cash', 'Наличные при получении'),
        ('bank_transfer', 'Банковский перевод'),
    ]

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment', verbose_name='Заказ')
    amount = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Сумма оплаты')
    status = models.CharField(max_length=20, choices=PAYMENT_STATUSES, default='pending', verbose_name='Статус')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, verbose_name='Способ оплаты')
    transaction_id = models.CharField(max_length=100, blank=True, verbose_name='ID транзакции')
    paid_at = models.DateTimeField(null=True, blank=True, verbose_name='Дата оплаты')

    class Meta:
        verbose_name = 'Оплата'
        verbose_name_plural = 'Оплаты'

    def __str__(self):
        return f'Оплата заказа #{self.order.id}'


class Favorite(BaseModel):
    """
    Модель избранных товаров
    """
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='favorites', 
        verbose_name='Пользователь'
    )
    product = models.ForeignKey(
        Product, 
        on_delete=models.CASCADE, 
        related_name='favorites', 
        verbose_name='Товар'
    )
    session_id = models.CharField(
        max_length=100, 
        null=True, 
        blank=True, 
        verbose_name='ID сессии (для гостей)'
    )

    class Meta:
        verbose_name = 'Избранный товар'
        verbose_name_plural = 'Избранные товары'
        unique_together = ('user', 'product')
        ordering = ['-created_at']

    def __str__(self):
        if self.user:
            return f'Избранное: {self.product.name} - {self.user.email}'
        return f'Избранное: {self.product.name} - сессия {self.session_id}'
