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
        exclude = ('slug',)

    def clean_specifications(self):
        value = self.cleaned_data.get('specifications')
        if value in (None, ''):
            return {}
        return value

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    form = ProductAdminForm
    list_display = ('name', 'slug', 'category', 'price', 'price_on_request', 'is_available', 'created_at')
    list_filter = ('category', 'is_available', 'price_on_request', 'created_at')
    search_fields = ('name', 'description', 'slug')
    readonly_fields = ('uuid', 'slug', 'created_at', 'updated_at')
    list_editable = ('is_available',)

    fieldsets = (
        ('Основная информация', {
            'fields': ('name', 'description', 'category', 'image', 'is_available')
        }),
        ('Цена', {
            'fields': ('price_on_request', 'price'),
            'description': 'Включите «Цена по запросу», чтобы скрыть цену на сайте. Поле «Цена» можно оставить для ориентира менеджера.',
        }),
        ('Характеристики товара', {
            'fields': ('specifications',),
            'description': (
                'Заполните характеристики товара в формате JSON. '
                'Пример: {"Цвет": "Натуральный", "Материал": "Дерево", "Размеры": "120x60x75 см"}'
            ),
            'classes': ('wide',)
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

    actions = ['make_available', 'make_unavailable']

    def make_available(self, request, queryset):
        updated = queryset.update(is_available=True)
        self.message_user(request, f'{updated} товаров опубликовано на сайте.')
    make_available.short_description = 'Показывать на сайте'

    def make_unavailable(self, request, queryset):
        updated = queryset.update(is_available=False)
        self.message_user(request, f'{updated} товаров скрыто с сайта.')
    make_unavailable.short_description = 'Скрыть с сайта'
