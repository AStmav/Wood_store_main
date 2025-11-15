from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import transaction
from orders.models import Order
from .tasks import send_order_notification_task
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=Order)
def send_order_notification(sender, instance, created, **kwargs):
    """Отправка уведомлений в Телеграм при создании нового заказа"""
    if created:
        def schedule_task():
            try:
                logger.info(f"Order created: {instance.id}, scheduling notification task after commit")
                send_order_notification_task.delay(instance.id)
            except Exception as e:
                logger.error(f"Failed to schedule order notification task: {e}")

        transaction.on_commit(schedule_task)