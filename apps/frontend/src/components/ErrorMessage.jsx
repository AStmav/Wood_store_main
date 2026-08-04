/**
 * Спокойная заглушка при ошибках API / падении бэкенда / сбое рендера.
 * Не красный fullscreen-алерт — бренд и понятный следующий шаг.
 */
export default function ErrorMessage({
  message,
  onRetry,
  variant = 'unavailable',
  fullPage = false,
  title,
}) {
  const copy = getCopy(variant, title, message);

  return (
    <div
      className={
        fullPage
          ? 'min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12'
          : 'flex items-center justify-center px-4 py-16 sm:py-24'
      }
      role="alert"
    >
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          {variant === 'notFound' ? (
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          ) : (
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M12 9v2m0 4h.01M4.93 19h14.14c1.54 0 2.5-1.67 1.73-2.5L13.73 4c-.77-.83-1.97-.83-2.74 0L3.2 16.5c-.77.83.19 2.5 1.73 2.5z"
              />
            </svg>
          )}
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-2">{copy.title}</h1>
        <p className="text-gray-600 leading-relaxed mb-8">{copy.message}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Обновить
            </button>
          )}
          <a
            href="/"
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
          >
            На главную
          </a>
        </div>

        <p className="mt-8 text-sm text-gray-400">
          Сказкин Дом · если проблема повторяется, напишите в WhatsApp
        </p>
      </div>
    </div>
  );
}

function getCopy(variant, title, message) {
  if (variant === 'notFound') {
    return {
      title: title || 'Ничего не найдено',
      message: message || 'Такой страницы или товара нет. Загляните в каталог на главной.',
    };
  }
  if (variant === 'generic') {
    return {
      title: title || 'Что-то пошло не так',
      message: message || 'Не удалось выполнить действие. Попробуйте ещё раз.',
    };
  }
  return {
    title: title || 'Сервис временно недоступен',
    message:
      message ||
      'Сайт не может связаться с сервером. Обновите страницу через минуту или зайдите позже.',
  };
}
