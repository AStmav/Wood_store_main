from django.contrib import admin
from django.utils.html import format_html
from .models import Order, OrderItem, Delivery, Payment, Cart, CartItem, Favorite

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('total_price',)

class DeliveryInline(admin.StackedInline):
    model = Delivery
    extra = 0
    readonly_fields = ('delivery_cost',)

class PaymentInline(admin.StackedInline):
    model = Payment
    extra = 0
    readonly_fields = ('amount', 'status', 'paid_at')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'get_status_display_colored', 'get_delivery_type', 'get_total_amount', 'get_telegram_status', 'created_at', 'get_is_deleted_display')
    list_filter = ('status', 'delivery__delivery_type', 'telegram_notification_sent', 'created_at', 'is_deleted')
    search_fields = ('id', 'user__email', 'user__phone', 'address', 'order_number')
    readonly_fields = ('total_amount', 'created_at', 'updated_at', 'order_number', 'telegram_notification_sent')
    inlines = [OrderItemInline, DeliveryInline, PaymentInline]
    
    # Группировка полей в админке
    fieldsets = (
        ('Основная информация', {
            'fields': ('user', 'order_number', 'status', 'total_amount')
        }),
        ('Контактная информация', {
            'fields': ('phone', 'email', 'address')
        }),
        ('Уведомления', {
            'fields': ('telegram_notification_sent',),
            'classes': ('collapse',)
        }),
        ('Дополнительно', {
            'fields': ('comment', 'is_deleted'),
            'classes': ('collapse',)
        }),
        ('Временные метки', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def get_status_display_colored(self, obj):
        """Отображение статуса с цветом"""
        color = obj.get_status_color()
        status_display = obj.get_status_display()
        return format_html(
            '<span style="color: {}; font-weight: bold; padding: 6px 12px; border-radius: 6px; background-color: {}20; border: 1px solid {}40; display: inline-block; min-width: 80px; text-align: center; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">{}</span>',
            color, color, color, status_display
        )
    get_status_display_colored.short_description = 'Статус'
    get_status_display_colored.admin_order_field = 'status'

    def get_delivery_type(self, obj):
        return obj.delivery.delivery_type if hasattr(obj, 'delivery') else '-'
    get_delivery_type.short_description = 'Тип доставки'

    def get_total_amount(self, obj):
        return f"{obj.total_amount} ₽"
    get_total_amount.short_description = 'Общая сумма'
    get_total_amount.admin_order_field = 'total_amount'
    
    def get_is_deleted_display(self, obj):
        """Отображение статуса удаления с цветом"""
        if obj.is_deleted:
            return format_html(
                '<span style="color: #dc3545; font-weight: bold; padding: 4px 8px; border-radius: 4px; background-color: #dc354520; border: 1px solid #dc354540;">УДАЛЕН</span>'
            )
        else:
            return format_html(
                '<span style="color: #28a745; font-weight: bold; padding: 4px 8px; border-radius: 4px; background-color: #28a74520; border: 1px solid #28a74540;">АКТИВЕН</span>'
            )
    get_is_deleted_display.short_description = 'Статус'
    get_is_deleted_display.admin_order_field = 'is_deleted'

    def get_telegram_status(self, obj):
        """Отображение статуса Telegram уведомления с цветом"""
        if obj.telegram_notification_sent:
            return format_html(
                '<span style="color: #28a745; font-weight: bold; padding: 4px 8px; border-radius: 4px; background-color: #28a74520; border: 1px solid #28a74540;">✅ ОТПРАВЛЕНО</span>'
            )
        else:
            return format_html(
                '<span style="color: #dc3545; font-weight: bold; padding: 4px 8px; border-radius: 4px; background-color: #dc354520; border: 1px solid #dc354540;">❌ НЕ ОТПРАВЛЕНО</span>'
            )
    get_telegram_status.short_description = 'Telegram'
    get_telegram_status.admin_order_field = 'telegram_notification_sent'

class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ('total_price',)

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'get_total_amount', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('id', 'user__email', 'user__phone')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [CartItemInline]

    def get_total_amount(self, obj):
        return sum(item.total_price for item in obj.items.all())
    get_total_amount.short_description = 'Общая сумма'


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'product', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__email', 'product__name')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('user', 'product')
        }),
        ('Временные метки', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
