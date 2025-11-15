from django.db import models
from django.utils.text import slugify
from furniture_store.models import BaseModel

class News(BaseModel):
    title = models.CharField(max_length=200, verbose_name='Заголовок')
    content = models.TextField(verbose_name='Содержание')
    excerpt = models.TextField(max_length=200, blank=True, verbose_name='Краткое описание')
    image = models.ImageField(upload_to='news/', blank=True, null=True, verbose_name='Изображение')
    slug = models.SlugField(max_length=200, unique=True, verbose_name='Slug')
    is_active =  models.BooleanField(default=True, verbose_name='Активна')
    published_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата публикации')
    
    class Meta:
        verbose_name = 'Новость'
        verbose_name_plural = 'Новости'
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        """Переопределим метод save для создания уникального slug"""
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)
    
    def get_excerpt(self):
        """Возвращаем краткое описание либо урезаное содержание"""
        if self.excerpt:
            return self.excerpt
        return self.content[:200]