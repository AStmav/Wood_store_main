from django.contrib import admin
from django import forms

from .models import Category, Product, ProductImage
from .discounts import calculate_sale_price


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
        exclude = ('slug', 'image')

    def clean_specifications(self):
        value = self.cleaned_data.get('specifications')
        if value in (None, ''):
            return {}
        return value

    def clean(self):
        cleaned_data = super().clean()
        price_on_request = cleaned_data.get('price_on_request')
        discount_percent = cleaned_data.get('discount_percent') or 0

        if price_on_request and discount_percent:
            cleaned_data['discount_percent'] = 0

        return cleaned_data


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    max_num = ProductImage.MAX_PER_PRODUCT
    fields = ('image', 'sort_order')
    ordering = ('sort_order', 'id')
    verbose_name = 'Изображение'
    verbose_name_plural = 'Галерея изображений (до 5)'


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    form = ProductAdminForm
    inlines = [ProductImageInline]
    list_display = (
        'name', 'slug', 'category', 'price', 'discount_percent',
        'price_on_request', 'is_available', 'created_at',
    )
    list_filter = ('category', 'is_available', 'price_on_request', 'discount_percent', 'created_at')
    search_fields = ('name', 'description', 'slug')
    readonly_fields = ('uuid', 'slug', 'created_at', 'updated_at', 'sale_price_preview')
    list_editable = ('is_available',)

    fieldsets = (
        ('Основная информация', {
            'fields': ('name', 'description', 'category', 'is_available'),
            'description': (
                'Фото — в блоке «Галерея» ниже (до 5). '
                'Первое по порядку показывается в каталоге и первым в карточке товара.'
            ),
        }),
        ('Цена', {
            'fields': ('price_on_request', 'price', 'discount_percent', 'sale_price_preview'),
            'description': (
                '«Цена» — базовая стоимость до скидки. '
                'Скидка задаётся шагом 5% (5–95). '
                'При «Цене по запросу» скидка на сайте не показывается.'
            ),
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

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)
        # Product.image — для каталога/заказов: берём первое фото галереи
        product = form.instance
        first = product.images.order_by('sort_order', 'id').first()
        image_name = first.image.name if first else ''
        if product.image.name != image_name:
            Product.objects.filter(pk=product.pk).update(image=image_name)

    actions = ['make_available', 'make_unavailable']

    @admin.display(description='Цена со скидкой')
    def sale_price_preview(self, obj):
        if obj is None or not obj.pk:
            return '—'
        if obj.price_on_request:
            return 'Цена по запросу'
        if not obj.discount_percent:
            return 'Без скидки'
        sale_price = calculate_sale_price(obj.price, obj.discount_percent)
        return f'{sale_price} ₽ (−{obj.discount_percent}%)'

    def make_available(self, request, queryset):
        updated = queryset.update(is_available=True)
        self.message_user(request, f'{updated} товаров опубликовано на сайте.')
    make_available.short_description = 'Показывать на сайте'

    def make_unavailable(self, request, queryset):
        updated = queryset.update(is_available=False)
        self.message_user(request, f'{updated} товаров скрыто с сайта.')
    make_unavailable.short_description = 'Скрыть с сайта'
