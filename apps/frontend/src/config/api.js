// Конфигурация поддомена бэкенда для туннеля
const BACKEND_TUNNEL_SUBDOMAIN = import.meta.env.VITE_BACKEND_TUNNEL_SUBDOMAIN || 'your-backend-subdomain';

// Определяем базовый URL API из переменных окружения
// Для production: не указывайте VITE_API_URL (будет использован относительный путь)
// Для development: установите VITE_API_URL=http://localhost:8000 в .env
const getApiBaseURL = () => {
  // Если указана переменная окружения VITE_API_URL, используем её
  const viteApiUrl = import.meta.env.VITE_API_URL;
  if (viteApiUrl && viteApiUrl.trim() !== '' && viteApiUrl !== 'undefined') {
    const url = viteApiUrl.trim();
    // Убираем слэш в конце если есть
    return url.endsWith('/') ? url.slice(0, -1) : url;
  }
  
  // Для туннеля localtunnel
  const tunnelSubdomain = import.meta.env.VITE_BACKEND_TUNNEL_SUBDOMAIN;
  if (tunnelSubdomain && tunnelSubdomain !== 'your-backend-subdomain') {
    return `https://${tunnelSubdomain}.loca.lt`;
    }
  
  // По умолчанию: пустая строка (production - относительные пути)
  return '';
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