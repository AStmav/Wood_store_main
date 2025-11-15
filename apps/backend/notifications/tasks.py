from celery import shared_task
from .services import TelegramService
from orders.models import Order
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3)
def send_order_notification_task(self, order_id):
    """Celery задача для отправки уведомления о заказе"""
    try:
        logger.info(f"Starting order notification task for order {order_id}")
        
        # Получаем заказ из базы данных
        order = Order.objects.get(id=order_id)
        
        # Создаем сервис Telegram
        telegram_service = TelegramService()
        
        # Отправляем уведомление
        success = telegram_service.send_order_notification(order)
        
        if success:
            # Обновляем статус заказа
            order.telegram_notification_sent = True
            order.save()
            logger.info(f"Order notification sent successfully for order {order_id}")
            return f"Notification sent for order {order_id}"
        else:
            logger.error(f"Failed to send notification for order {order_id}")
            raise Exception("Failed to send notification")
            
    except Order.DoesNotExist:
        logger.error(f"Order {order_id} not found")
        raise Exception(f"Order {order_id} not found")
    except Exception as exc:
        logger.error(f"Error in order notification task: {exc}")
        # Повторяем задачу через 60 секунд
        raise self.retry(exc=exc, countdown=60)

@shared_task
def check_unsent_orders():
    """Проверка неотправленных заказов каждую минуту"""
    try:
        # Получаем заказы без уведомлений
        orders = Order.objects.filter(telegram_notification_sent=False)
        
        for order in orders:
            try:
                # Отправляем уведомление асинхронно
                send_order_notification_task.delay(order.id)
                logger.info(f"Scheduled notification for order {order.id}")
            except Exception as e:
                logger.error(f"Failed to schedule notification for order {order.id}: {e}")
        
        logger.info(f"Checked {len(orders)} unsent orders")
    except Exception as e:
        logger.error(f"Failed to check unsent orders: {e}")