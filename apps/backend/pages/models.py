from django.db import models
from django.utils.text import slugify

from furniture_store.models import BaseModel


class Page(BaseModel):
    """Статическая страница сайта (соглашения, политики и т.д.)."""

    title = models.CharField(max_length=200, verbose_name='Заголовок')
    slug = models.SlugField(max_length=200, unique=True, verbose_name='Slug')
    content = models.TextField(verbose_name='Содержание (HTML)')
    is_active = models.BooleanField(default=True, verbose_name='Активна')

    class Meta:
        verbose_name = 'Страница'
        verbose_name_plural = 'Страницы'
        ordering = ['title']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title, allow_unicode=True)
        super().save(*args, **kwargs)
