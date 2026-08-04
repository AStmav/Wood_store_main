from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from .models import Category, Product
from .views import invalidate_catalog_caches


@receiver(post_save, sender=Product)
@receiver(post_delete, sender=Product)
@receiver(post_save, sender=Category)
@receiver(post_delete, sender=Category)
def clear_catalog_cache(**kwargs):
    invalidate_catalog_caches()
