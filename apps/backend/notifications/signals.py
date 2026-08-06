from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import transaction
from orders.models import Order
from .tasks import send_order_notification_task
from .services import notify_manager_about_order
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Order)
def send_order_notification(sender, instance, created, **kwargs):
    """Отправка уведомлений менеджеру при создании новой заявки."""
    if not created:
        return

    def schedule_task():
        try:
            logger.info('Order created: %s, scheduling notification task after commit', instance.id)
            send_order_notification_task.delay(instance.id)
        except Exception as e:
            logger.error('Failed to schedule order notification task: %s — sync fallback', e)
            try:
                notify_manager_about_order(instance)
            except Exception as sync_err:
                logger.error('Sync order notification failed: %s', sync_err)

    transaction.on_commit(schedule_task)
