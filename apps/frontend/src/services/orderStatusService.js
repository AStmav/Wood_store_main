/**
 * Сервис для управления статусами заказов
 */

// Определение статусов и их свойств
export const ORDER_STATUSES = {
  NEW: 'new',
  PROCESSING: 'processing', 
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

// Цвета для статусов
export const STATUS_COLORS = {
  [ORDER_STATUSES.NEW]: 'bg-yellow-100 text-yellow-800',
  [ORDER_STATUSES.PROCESSING]: 'bg-blue-100 text-blue-800',
  [ORDER_STATUSES.SHIPPED]: 'bg-purple-100 text-purple-800',
  [ORDER_STATUSES.DELIVERED]: 'bg-green-100 text-green-800',
  [ORDER_STATUSES.CANCELLED]: 'bg-red-100 text-red-800',
};

// Лейблы для статусов
export const STATUS_LABELS = {
  [ORDER_STATUSES.NEW]: 'Новый заказ',
  [ORDER_STATUSES.PROCESSING]: 'В обработке',
  [ORDER_STATUSES.SHIPPED]: 'Отправлен',
  [ORDER_STATUSES.DELIVERED]: 'Доставлен',
  [ORDER_STATUSES.CANCELLED]: 'Отменен',
};

// Описания статусов для пользователей
export const STATUS_DESCRIPTIONS = {
  [ORDER_STATUSES.NEW]: 'Ваш заказ принят и ожидает обработки',
  [ORDER_STATUSES.PROCESSING]: 'Заказ обрабатывается, готовится к отправке',
  [ORDER_STATUSES.SHIPPED]: 'Заказ отправлен и находится в пути',
  [ORDER_STATUSES.DELIVERED]: 'Заказ успешно доставлен',
  [ORDER_STATUSES.CANCELLED]: 'Заказ был отменен',
};

// Возможные переходы между статусами
export const STATUS_TRANSITIONS = {
  [ORDER_STATUSES.NEW]: [ORDER_STATUSES.PROCESSING, ORDER_STATUSES.CANCELLED],
  [ORDER_STATUSES.PROCESSING]: [ORDER_STATUSES.SHIPPED, ORDER_STATUSES.CANCELLED],
  [ORDER_STATUSES.SHIPPED]: [ORDER_STATUSES.DELIVERED],
  [ORDER_STATUSES.DELIVERED]: [], // Финальный статус
  [ORDER_STATUSES.CANCELLED]: [], // Финальный статус
};

// Действия, доступные пользователю для каждого статуса
export const USER_ACTIONS = {
  [ORDER_STATUSES.NEW]: [
    { action: 'cancel', label: 'Отменить заказ', color: 'red' }
  ],
  [ORDER_STATUSES.PROCESSING]: [
    { action: 'cancel', label: 'Отменить заказ', color: 'red' }
  ],
  [ORDER_STATUSES.SHIPPED]: [
    { action: 'track', label: 'Отследить посылку', color: 'blue' }
  ],
  [ORDER_STATUSES.DELIVERED]: [
    { action: 'review', label: 'Оставить отзыв', color: 'green' }
  ],
  [ORDER_STATUSES.CANCELLED]: []
};

// Действия, доступные администратору для каждого статуса
export const ADMIN_ACTIONS = {
  [ORDER_STATUSES.NEW]: [
    { action: 'process', label: 'Взять в обработку', color: 'blue' },
    { action: 'cancel', label: 'Отменить заказ', color: 'red' }
  ],
  [ORDER_STATUSES.PROCESSING]: [
    { action: 'ship', label: 'Отправить заказ', color: 'purple' },
    { action: 'cancel', label: 'Отменить заказ', color: 'red' }
  ],
  [ORDER_STATUSES.SHIPPED]: [
    { action: 'deliver', label: 'Отметить как доставленный', color: 'green' }
  ],
  [ORDER_STATUSES.DELIVERED]: [],
  [ORDER_STATUSES.CANCELLED]: []
};

/**
 * Получить цвет для статуса
 */
export const getStatusColor = (status) => {
  return STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Получить лейбл для статуса
 */
export const getStatusLabel = (status) => {
  return STATUS_LABELS[status] || 'Неизвестный статус';
};

/**
 * Получить описание для статуса
 */
export const getStatusDescription = (status) => {
  return STATUS_DESCRIPTIONS[status] || 'Статус не определен';
};

/**
 * Получить доступные действия для пользователя
 */
export const getUserActions = (status) => {
  return USER_ACTIONS[status] || [];
};

/**
 * Получить доступные действия для администратора
 */
export const getAdminActions = (status) => {
  return ADMIN_ACTIONS[status] || [];
};

/**
 * Проверить, можно ли перейти из одного статуса в другой
 */
export const canTransitionTo = (fromStatus, toStatus) => {
  return STATUS_TRANSITIONS[fromStatus]?.includes(toStatus) || false;
};

/**
 * Получить следующий статус в цепочке
 */
export const getNextStatus = (currentStatus) => {
  const transitions = STATUS_TRANSITIONS[currentStatus];
  if (!transitions || transitions.length === 0) return null;
  
  // Возвращаем первый возможный переход (основной путь)
  return transitions.find(status => status !== ORDER_STATUSES.CANCELLED) || transitions[0];
};

/**
 * Проверить, является ли статус финальным
 */
export const isFinalStatus = (status) => {
  return status === ORDER_STATUSES.DELIVERED || status === ORDER_STATUSES.CANCELLED;
};

/**
 * Получить прогресс заказа в процентах
 */
export const getOrderProgress = (status) => {
  const progressMap = {
    [ORDER_STATUSES.NEW]: 20,
    [ORDER_STATUSES.PROCESSING]: 40,
    [ORDER_STATUSES.SHIPPED]: 70,
    [ORDER_STATUSES.DELIVERED]: 100,
    [ORDER_STATUSES.CANCELLED]: 0,
  };
  
  return progressMap[status] || 0;
};
