from django.db import models
from django.db.models import JSONField

from furniture_store.models import BaseModel
from .slugs import assign_unique_slug, product_slug_base, slug_base_from_name


class Category(BaseModel):
    name = models.CharField(max_length=100, unique=True, verbose_name='Название категории')
    description = models.TextField(blank=True, verbose_name='Описание')
    slug = models.SlugField(max_length=100, unique=True, verbose_name='Slug')

    class Meta:
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if self._should_regenerate_slug():
            base_slug = slug_base_from_name(self.name, prefix='category')
            self.slug = assign_unique_slug(self, base_slug, max_length=100)
        super().save(*args, **kwargs)

    def _should_regenerate_slug(self) -> bool:
        if not self.pk:
            return True
        if not self.slug:
            return True
        try:
            old = Category.objects.get(pk=self.pk)
        except Category.DoesNotExist:
            return True
        return old.name != self.name


class Product(BaseModel):
    name = models.CharField(max_length=200, verbose_name='Название товара')
    description = models.TextField(blank=True, verbose_name='Описание товара')
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Цена')
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='products',
        verbose_name='Категория',
    )
    image = models.ImageField(upload_to='products/', blank=True, null=True, verbose_name='Изображение')
    rating = models.FloatField(default=0.0, verbose_name='Рейтинг')
    slug = models.SlugField(max_length=200, unique=True, verbose_name='Slug')
    stock_quantity = models.PositiveIntegerField(default=0, verbose_name='Количество на складе')
    is_available = models.BooleanField(default=True, verbose_name='Доступен для заказа')
    specifications = JSONField(default=dict, blank=True, verbose_name='Характеристики')

    class Meta:
        verbose_name = 'Товар'
        verbose_name_plural = 'Товары'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if self._should_regenerate_slug():
            base_slug = product_slug_base(self.name, self.category)
            self.slug = assign_unique_slug(self, base_slug, max_length=200)
        super().save(*args, **kwargs)

    def _should_regenerate_slug(self) -> bool:
        if not self.pk:
            return True
        if not self.slug:
            return True
        try:
            old = Product.objects.get(pk=self.pk)
        except Product.DoesNotExist:
            return True
        return old.name != self.name or old.category_id != self.category_id
