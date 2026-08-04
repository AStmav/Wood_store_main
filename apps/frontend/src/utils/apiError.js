/**
 * Классификация ошибок axios / fetch для UI-заглушек.
 */

export function isBackendUnavailable(error) {
  if (!error) return false;
  // Нет ответа: сеть, CORS, backend down, nginx 502 без JSON
  if (!error.response) {
    return true;
  }
  const status = error.response.status;
  return status === 502 || status === 503 || status === 504 || status >= 500;
}

export function isNotFound(error) {
  return error?.response?.status === 404;
}

/**
 * @returns {'unavailable' | 'notFound' | 'generic'}
 */
export function getErrorVariant(error) {
  if (isBackendUnavailable(error)) return 'unavailable';
  if (isNotFound(error)) return 'notFound';
  return 'generic';
}

export function getFriendlyErrorMessage(error, fallback = 'Не удалось загрузить данные') {
  const variant = getErrorVariant(error);
  if (variant === 'unavailable') {
    return 'Сервис временно недоступен. Попробуйте обновить страницу через минуту.';
  }
  if (variant === 'notFound') {
    return 'Запрашиваемая страница или данные не найдены.';
  }
  if (error?.code === 'ECONNABORTED') {
    return 'Превышено время ожидания ответа. Проверьте соединение и попробуйте снова.';
  }
  return fallback;
}
