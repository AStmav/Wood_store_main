from celery import shared_task
from django.db.models import Q
from orders.models import Order
from .services import notify_manager_about_order
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def send_order_notification_task(self, order_id):
    """Уведомление менеджеру: email и/или Telegram."""
    try:
        logger.info('Starting order notification task for order %s', order_id)
        order = Order.objects.get(id=order_id)
        result = notify_manager_about_order(order)

        if result.get('email') or result.get('telegram'):
            logger.info(
                'Order %s notified: email=%s telegram=%s',
                order_id,
                result.get('email'),
                result.get('telegram'),
            )
            return f"Notification sent for order {order_id}: {result}"

        logger.error('Failed to send any notification for order %s', order_id)
        raise Exception('Failed to send notification')

    except Order.DoesNotExist:
        logger.error('Order %s not found', order_id)
        raise Exception(f'Order {order_id} not found')
    except Exception as exc:
        logger.error('Error in order notification task: %s', exc)
        raise self.retry(exc=exc, countdown=60)


@shared_task
def check_unsent_orders():
    """Повторная отправка заявок без успешного email и без Telegram."""
    try:
        orders = Order.objects.filter(
            Q(email_notification_sent=False) & Q(telegram_notification_sent=False),
            is_deleted=False,
        )
        for order in orders:
            try:
                send_order_notification_task.delay(order.id)
                logger.info('Scheduled notification for order %s', order.id)
            except Exception as e:
                logger.error('Failed to schedule notification for order %s: %s', order.id, e)
                # Fallback без Celery — хотя бы email синхронно
                try:
                    notify_manager_about_order(order)
                except Exception as sync_err:
                    logger.error('Sync notify failed for order %s: %s', order.id, sync_err)

        logger.info('Checked %s unsent orders', orders.count())
    except Exception as e:
        logger.error('Failed to check unsent orders: %s', e)
