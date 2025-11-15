// Конфигурация поддомена бэкенда для туннеля
// После запуска: lt --port 8000 --subdomain your-backend-subdomain
// Укажите здесь поддомен, который вам выдал localtunnel
const BACKEND_TUNNEL_SUBDOMAIN = import.meta.env.VITE_BACKEND_TUNNEL_SUBDOMAIN || 'your-backend-subdomain';

// Определяем базовый URL API в зависимости от окружения
const getApiBaseURL = () => {
  // Если указана переменная окружения VITE_API_URL, используем её
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL;
    return url.endsWith('/') ? url.slice(0, -1) : url;
  }
  
  // Если фронтенд доступен через туннель localtunnel
  if (typeof window !== 'undefined' && window.location.hostname.includes('loca.lt')) {
    // Используем поддомен бэкенда из конфигурации
    if (BACKEND_TUNNEL_SUBDOMAIN && BACKEND_TUNNEL_SUBDOMAIN !== 'your-backend-subdomain') {
      return `https://${BACKEND_TUNNEL_SUBDOMAIN}.loca.lt`;
    }
    // Если поддомен не настроен, пробуем использовать localhost
    console.warn('⚠️ Backend tunnel subdomain not configured. Using localhost (may not work through tunnel)');
    return 'http://localhost:8000';
  }
  
  // Локальная разработка
  return 'http://localhost:8000';
};

// Простая функция для получения полного URL изображения
export const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${getApiBaseURL()}${path}`;
}; 