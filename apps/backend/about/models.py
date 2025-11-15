from django.db import models


class About(models.Model):
    """Модель для управления разделом 'О нас'"""
    
    title = models.CharField(
        max_length=200, 
        verbose_name='Заголовок',
        help_text='Основной заголовок раздела "О нас"'
    )
    
    content = models.TextField(
        verbose_name='Содержание',
        help_text='Основной текст раздела "О нас"'
    )
    
    image = models.ImageField(
        upload_to='about/',
        verbose_name='Изображение',
        blank=True,
        null=True,
        help_text='Изображение для раздела "О нас"'
    )
    
    is_active = models.BooleanField(
        default=True,
        verbose_name='Активен',
        help_text='Показывать ли раздел на сайте'
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата создания'
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Дата обновления'
    )
    
    class Meta:
        verbose_name = 'О нас'
        verbose_name_plural = 'О нас'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title 