from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _

from catalog.models import Product
from furniture_store.models import BaseModel


class ProductView(BaseModel):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='views',
        verbose_name=_('Товар'),
        db_index=True,
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_('Пользователь'),
    )
    session_id = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_('ID сессии'),
    )
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        verbose_name=_('IP адрес'),
    )
    user_agent = models.TextField(
        blank=True,
        verbose_name=_('User-Agent'),
    )
    path = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_('Путь'),
    )
    referrer = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_('Источник перехода'),
    )

    class Meta:
        verbose_name = _('Просмотр товара')
        verbose_name_plural = _('Просмотры товаров')
        indexes = [
            models.Index(fields=['product', 'created_at'], name='analytics_p_product_9e5e76_idx'),
            models.Index(fields=['session_id', 'created_at'], name='analytics_p_session_07720e_idx'),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.product.name} ({self.created_at:%d.%m.%Y %H:%M})'


class SiteVisit(BaseModel):
    path = models.CharField(
        max_length=255,
        verbose_name=_('Путь'),
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name=_('Пользователь'),
    )
    session_id = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_('ID сессии'),
    )
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        verbose_name=_('IP адрес'),
    )
    user_agent = models.TextField(
        blank=True,
        verbose_name=_('User-Agent'),
    )
    referrer = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_('Источник перехода'),
    )

    class Meta:
        verbose_name = _('Посещение сайта')
        verbose_name_plural = _('Посещения сайта')
        indexes = [
            models.Index(fields=['created_at'], name='analytics_s_created_04f2f5_idx'),
            models.Index(fields=['session_id', 'created_at'], name='analytics_s_session_934c24_idx'),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.path} ({self.created_at:%d.%m.%Y %H:%M})'


