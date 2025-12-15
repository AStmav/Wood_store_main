// Конфигурация поддомена бэкенда для туннеля
const BACKEND_TUNNEL_SUBDOMAIN = import.meta.env.VITE_BACKEND_TUNNEL_SUBDOMAIN || 'your-backend-subdomain';

// Определяем базовый URL API в зависимости от окружения
const getApiBaseURL = () => {
  // ВАЖНО: Сначала проверяем hostname (самый надежный способ)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // В production используем относительный путь (пустая строка для медиа)
    if (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.includes('loca.lt')) {
      return '';
    }
    
    // Если фронтенд доступен через туннель localtunnel
    if (hostname.includes('loca.lt')) {
      if (BACKEND_TUNNEL_SUBDOMAIN && BACKEND_TUNNEL_SUBDOMAIN !== 'your-backend-subdomain') {
        return `https://${BACKEND_TUNNEL_SUBDOMAIN}.loca.lt`;
      }
      return 'http://localhost:8000';
    }
  }
  
  // Только для localhost проверяем переменную окружения VITE_API_URL
  const viteApiUrl = import.meta.env.VITE_API_URL;
  if (viteApiUrl && viteApiUrl.trim() !== '' && viteApiUrl !== 'undefined') {
    const url = viteApiUrl.trim();
    // Защита: если в переменной localhost, но мы не на localhost - игнорируем
    if (url.includes('localhost') && typeof window !== 'undefined' && 
        window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return '';
    }
    return url.endsWith('/') ? url.slice(0, -1) : url;
  }
  
  // Локальная разработка
  return 'http://localhost:8000';
};

// Простая функция для получения полного URL изображения
export const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const baseUrl = getApiBaseURL();
  // Если baseUrl пустой (production), используем относительный путь
  if (!baseUrl) return path;
  return `${baseUrl}${path}`;
}; 