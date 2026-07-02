
import requests
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class TelegramService:
    def __init__(self):
        self.bot_token = settings.TELEGRAM_BOT_TOKEN
        self.channel_id = settings.TELEGRAM_CHANNEL_ID
        self.base_url = f"https://api.telegram.org/bot{self.bot_token}"
        
        # Нормализуем ID канала (добавляем префикс -100 для приватных каналов)
        self.channel_id = self._normalize_channel_id(self.channel_id)
        
        # Для приватных каналов автоматически получаем числовой ID
        if self.channel_id and self.channel_id.startswith('@'):
            chat_info = self.get_chat_info()
            if chat_info and chat_info.get('id'):
                self.channel_id = self._normalize_channel_id(str(chat_info.get('id')))
    
    def _normalize_channel_id(self, channel_id):
        """Нормализация ID канала для Telegram API
        
        Для приватных каналов Telegram API требует формат: -100XXXXXXXXXX
        Если ID положительное число без префикса, добавляем -100
        """
        if not channel_id:
            return channel_id
        
        channel_id = str(channel_id).strip()
        
        # Если это уже правильный формат (начинается с -100 или @)
        if channel_id.startswith('-100') or channel_id.startswith('@'):
            return channel_id
        
        # Если это положительное число (возможно ID приватного канала без префикса)
        try:
            numeric_id = int(channel_id)
            if numeric_id > 0:
                # Проверяем длину - если это похоже на ID канала (обычно 10-13 цифр)
                if len(channel_id) >= 9:
                    return f"-100{channel_id}"
        except ValueError:
            # Не число, возвращаем как есть
            pass
        
        return channel_id
    
    def get_chat_info(self, chat_id=None):
        """Получение информации о канале/чате для диагностики"""
        if not chat_id:
            chat_id = self.channel_id
        
        if not chat_id:
            logger.error("Chat ID не указан")
            return None
        
        # Нормализуем ID перед запросом
        normalized_chat_id = self._normalize_channel_id(str(chat_id))
        
        url = f"{self.base_url}/getChat"
        data = {'chat_id': normalized_chat_id}
        
        try:
            response = requests.post(url, data=data, timeout=10)
            response.raise_for_status()
            result = response.json()
            
            if result.get('ok'):
                chat_info = result.get('result', {})
                chat_id_from_api = chat_info.get('id')
                
                # Нормализуем ID из ответа API
                if chat_id_from_api:
                    normalized_response_id = self._normalize_channel_id(str(chat_id_from_api))
                    if normalized_response_id != str(chat_id_from_api):
                        chat_info['normalized_id'] = normalized_response_id
                
                return chat_info
            else:
                # Если использовали ID без префикса, попробуем с префиксом
                if not str(normalized_chat_id).startswith('-100') and str(normalized_chat_id).isdigit():
                    prefixed_id = f"-100{normalized_chat_id}"
                    data['chat_id'] = prefixed_id
                    try:
                        response = requests.post(url, data=data, timeout=10)
                        result = response.json()
                        if result.get('ok'):
                            return result.get('result', {})
                    except:
                        pass
                
                return None
                
        except Exception:
            # Попробуем с нормализованным ID
            if not str(normalized_chat_id).startswith('-100') and str(normalized_chat_id).isdigit():
                prefixed_id = f"-100{normalized_chat_id}"
                try:
                    response = requests.post(url, data={'chat_id': prefixed_id}, timeout=10)
                    result = response.json()
                    if result.get('ok'):
                        return result.get('result', {})
                except:
                    pass
            
            return None
    
    def get_channel_id_from_updates(self):
        """Попытка получить ID канала через getUpdates (если бот уже получал сообщения из канала)"""
        try:
            url = f"{self.base_url}/getUpdates"
            response = requests.post(url, timeout=10)
            response.raise_for_status()
            result = response.json()
            
            if result.get('ok'):
                updates = result.get('result', [])
                
                # Ищем channel posts
                for update in updates:
                    if 'channel_post' in update:
                        chat = update['channel_post'].get('chat', {})
                        chat_id = chat.get('id')
                        chat_type = chat.get('type')
                        
                        if chat_id and chat_type == 'channel':
                            return self._normalize_channel_id(str(chat_id))
                
                return None
            else:
                return None
                
        except Exception:
            return None

    def send_message(self, text, parse_mode='HTML', retry_with_numeric_id=False):
        """Отправка сообщения в Telegram канал"""
        if not self.bot_token or not self.channel_id:
            logger.error("Telegram bot token or channel_id not configured")
            return False
        
        url = f"{self.base_url}/sendMessage"
        data = {
            'chat_id': self.channel_id,
            'text': text,
            'parse_mode': parse_mode
        }
        try:
            response = requests.post(url, data=data, timeout=10)
            response.raise_for_status()
            
            # Проверяем ответ API
            result = response.json()
            if result.get('ok'):
                logger.info("Telegram message sent successfully")
                return True
            else:
                error_description = result.get('description', 'Unknown error')
                logger.error(f"Telegram API вернул ошибку: {error_description}")
                return False
                
        except requests.exceptions.HTTPError as e:
            # Обрабатываем HTTP ошибки отдельно для получения деталей
            if e.response is not None:
                try:
                    error_data = e.response.json()
                    error_description = error_data.get('description', 'Unknown error')
                    error_code = error_data.get('error_code', '')
                    
                    # Краткое логирование ошибки
                    if 'chat not found' in error_description.lower():
                        logger.error(f"Telegram: канал не найден (channel_id: {self.channel_id})")
                        
                        # Пробуем автоматически получить правильный ID
                        channel_id_from_updates = self.get_channel_id_from_updates()
                        if channel_id_from_updates:
                            self.channel_id = channel_id_from_updates
                            logger.info(f"ID получен через getUpdates: {channel_id_from_updates}")
                        
                        chat_info = self.get_chat_info()
                        if chat_info and chat_info.get('id'):
                            numeric_id = chat_info.get('id')
                            normalized_id = self._normalize_channel_id(str(numeric_id))
                            
                            # Автоматическая повторная попытка
                            if not retry_with_numeric_id:
                                self.channel_id = normalized_id
                                data['chat_id'] = normalized_id
                                try:
                                    response = requests.post(url, data=data, timeout=10)
                                    response.raise_for_status()
                                    result = response.json()
                                    if result.get('ok'):
                                        logger.info(f"Сообщение отправлено. Обновите .env: TELEGRAM_CHANNEL_ID={normalized_id}")
                                        return True
                                except:
                                    pass
                    elif 'can\'t parse entities' in error_description.lower():
                        logger.error(f"Telegram: ошибка форматирования сообщения")
                    elif 'unauthorized' in error_description.lower():
                        logger.error("Telegram: бот не авторизован (проверьте токен)")
                    elif 'forbidden' in error_description.lower():
                        logger.error("Telegram: бот не имеет прав (добавьте как администратора)")
                    else:
                        logger.error(f"Telegram: {error_description}")
                        
                except:
                    logger.error(f"Telegram: HTTP ошибка {e.response.status_code}")
            else:
                logger.error(f"Telegram: ошибка соединения")
            return False
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Telegram: ошибка соединения")
            return False

    def send_order_notification(self, order):
        """Отправка уведомления о новом заказе"""
        try:
            message = self._format_order_message(order)
            return self.send_message(message)
        except Exception as e:
            logger.error(f"Failed to send order notification: {e}")
            return False

    def _format_order_message(self, order):
        """Форматированное сообщение о заказе"""
        contact_line = ''
        if order.customer_name:
            contact_line = f"👤 <b>Клиент:</b> {order.customer_name}\n"

        message = f"""
📋 <b>НОВАЯ ЗАЯВКА НА РАСЧЁТ #{order.id}</b>

{contact_line}📞 <b>Телефон:</b> {order.phone}
📧 <b>Email:</b> {order.email or 'Не указан'}
📍 <b>Адрес:</b> {order.address or 'Не указан'}

💰 <b>Ориентир по прайсу:</b> {order.total_amount} ₽
📅 <b>Дата:</b> {order.created_at.strftime('%d.%m.%Y %H:%M')}

🛍️ <b>Интересуется:</b>
"""
        
        for item in order.items.all():
            message += f"✔ {item.product.name}\n"
        
        message += f"""
📝 <b>Комментарий:</b> {order.comment or 'Нет комментария'}

🔗 <b>Ссылка на заявку:</b> http://localhost:8000/admin/orders/order/{order.id}/
"""
        return message
