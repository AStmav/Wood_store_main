from django.db import models
from django.utils.text import slugify
from django.db.models import JSONField
from furniture_store.models import BaseModel
from rest_framework.permissions import AllowAny, IsAdminUser

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
        """
        Автоматически генерирует slug из названия категории.
        Обрабатывает конфликты уникальности, добавляя суффикс с числом.
        """
        # Генерируем slug из названия
        base_slug = slugify(self.name)
        
        # Если это новый объект (нет pk)
        if not self.pk:
            # Генерируем уникальный slug
            self.slug = self._generate_unique_slug(base_slug)
        else:
            # Это обновление существующего объекта
            try:
                old_instance = Category.objects.get(pk=self.pk)
                # Если название изменилось, генерируем новый slug
                if old_instance.name != self.name:
                    self.slug = self._generate_unique_slug(base_slug)
                # Если название не изменилось и slug пустой, генерируем его
                elif not self.slug:
                    self.slug = self._generate_unique_slug(base_slug)
                # Если название не изменилось и slug есть, оставляем его без изменений
            except Category.DoesNotExist:
                # Если объект не найден в БД (редкий случай), генерируем slug
                self.slug = self._generate_unique_slug(base_slug)
        
        super().save(*args, **kwargs)
    
    def _generate_unique_slug(self, base_slug):
        """
        Генерирует уникальный slug, добавляя суффикс с числом при конфликтах.
        """
        slug = base_slug
        counter = 1
        
        while Category.objects.filter(slug=slug).exclude(pk=self.pk if self.pk else None).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        return slug

class Product(BaseModel):
    name = models.CharField(max_length=200, verbose_name='Название товара')
    description = models.TextField(blank=True, verbose_name='Описание товара')
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Цена')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products', verbose_name='Категория')
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
        """
        Автоматически генерирует slug из названия товара.
        Обрабатывает конфликты уникальности, добавляя суффикс с числом.
        """
        # Генерируем slug из названия
        base_slug = slugify(self.name)
        
        # Если это новый объект (нет pk)
        if not self.pk:
            # Генерируем уникальный slug
            self.slug = self._generate_unique_slug(base_slug)
        else:
            # Это обновление существующего объекта
            try:
                old_instance = Product.objects.get(pk=self.pk)
                # Если название изменилось, генерируем новый slug
                if old_instance.name != self.name:
                    self.slug = self._generate_unique_slug(base_slug)
                # Если название не изменилось и slug пустой, генерируем его
                elif not self.slug:
                    self.slug = self._generate_unique_slug(base_slug)
                # Если название не изменилось и slug есть, оставляем его без изменений
            except Product.DoesNotExist:
                # Если объект не найден в БД (редкий случай), генерируем slug
                self.slug = self._generate_unique_slug(base_slug)
        
        super().save(*args, **kwargs)
    
    def _generate_unique_slug(self, base_slug):
        """
        Генерирует уникальный slug, добавляя суффикс с числом при конфликтах.
        """
        slug = base_slug
        counter = 1
        
        while Product.objects.filter(slug=slug).exclude(pk=self.pk if self.pk else None).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        return slug 