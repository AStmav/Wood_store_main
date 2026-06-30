from django.contrib import admin
from django.db import models
from django import forms
from .models import Category, Product

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent', 'sort_order', 'is_active', 'slug', 'created_at')
    list_filter = ('is_active', 'parent')
    search_fields = ('name', 'slug')
    list_editable = ('sort_order', 'is_active')
    readonly_fields = ('uuid', 'slug', 'created_at', 'updated_at')
    autocomplete_fields = ('parent',)
    ordering = ('sort_order', 'name')

    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'parent', 'image', 'sort_order', 'is_active'),
        }),
        ('Системная информация', {
            'fields': ('uuid', 'slug', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

class ProductAdminForm(forms.ModelForm):
    """Форма для товара с улучшенным полем характеристик"""
    specifications = forms.JSONField(
        required=False,
        initial=dict,
        help_text=(
            'Введите характеристики в формате JSON. '
            'Можно оставить пустым — сохранится как {}. '
            'Пример: {"Цвет": "Натуральный", "Материал": "Дерево"}'
        ),
        widget=forms.Textarea(attrs={
            'rows': 5,
            'cols': 80,
            'placeholder': '{\n  "Цвет": "Натуральный",\n  "Материал": "Дерево"\n}'
        })
    )

    class Meta:
        model = Product
        exclude = ('slug',)  # генерируется автоматически из названия

    def clean_specifications(self):
        value = self.cleaned_data.get('specifications')
        if value in (None, ''):
            return {}
        return value

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    form = ProductAdminForm
    list_display = ('name', 'slug', 'category', 'price', 'stock_quantity', 'is_available', 'stock_status', 'rating', 'created_at')
    list_filter = ('category', 'is_available', 'created_at')
    search_fields = ('name', 'description', 'slug')
    readonly_fields = ('uuid', 'slug', 'created_at', 'updated_at', 'stock_status')

    fieldsets = (
        ('Основная информация', {
            'fields': ('name', 'description', 'category', 'image')
        }),
        ('Цена и рейтинг', {
            'fields': ('price', 'rating')
        }),
        ('Характеристики товара', {
            'fields': ('specifications',),
            'description': (
                'Заполните характеристики товара в формате JSON. '
                'Пример: {"Цвет": "Натуральный", "Материал": "Дерево", "Размеры": "120x60x75 см"}'
            ),
            'classes': ('wide',)
        }),
        ('Наличие товара', {
            'fields': ('stock_quantity', 'is_available', 'stock_status'),
            'description': 'Управление количеством и доступностью товара'
        }),
        ('Системная информация', {
            'fields': ('uuid', 'created_at', 'updated_at'),
            'classes': ('collapse',),
            'description': (
                'Slug создаётся автоматически: «название-категория». '
                'При совпадении добавляется суффикс -2, -3, …'
            ),
        }),
    )

    def get_fieldsets(self, request, obj=None):
        fieldsets = super().get_fieldsets(request, obj)
        if obj is not None:
            fieldsets = list(fieldsets)
            fieldsets[-1] = (
                'Системная информация',
                {
                    'fields': ('uuid', 'slug', 'created_at', 'updated_at'),
                    'classes': ('collapse',),
                    'description': (
                'Slug создаётся автоматически: «название-категория». '
                'При совпадении добавляется суффикс -2, -3, …'
            ),
                },
            )
        return fieldsets
    
    def stock_status(self, obj):
        """Отображает статус наличия товара"""
        if not obj.is_available:
            return "❌ Недоступен"
        elif obj.stock_quantity == 0:
            return "🔴 Нет в наличии"
        elif obj.stock_quantity <= 5:
            return f"🟡 Мало ({obj.stock_quantity} шт.)"
        else:
            return f"🟢 В наличии ({obj.stock_quantity} шт.)"
    
    stock_status.short_description = 'Статус наличия'
    stock_status.admin_order_field = 'stock_quantity'
    
    actions = ['make_available', 'make_unavailable', 'restock_products']
    
    def make_available(self, request, queryset):
        """Делает выбранные товары доступными"""
        updated = queryset.update(is_available=True)
        self.message_user(request, f'{updated} товаров сделано доступными.')
    make_available.short_description = "Сделать доступными"
    
    def make_unavailable(self, request, queryset):
        """Делает выбранные товары недоступными"""
        updated = queryset.update(is_available=False)
        self.message_user(request, f'{updated} товаров сделано недоступными.')
    make_unavailable.short_description = "Сделать недоступными"
    
    def restock_products(self, request, queryset):
        """Пополняет склад выбранных товаров"""
        updated = queryset.update(stock_quantity=100)
        self.message_user(request, f'{updated} товаров пополнено до 100 шт.')
    restock_products.short_description = "Пополнить склад (100 шт.)"
