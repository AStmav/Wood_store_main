import axios from 'axios';

// Конфигурация поддомена бэкенда для туннеля
const BACKEND_TUNNEL_SUBDOMAIN = import.meta.env.VITE_BACKEND_TUNNEL_SUBDOMAIN || 'your-backend-subdomain';

// Определяем базовый URL API в зависимости от окружения
const getApiBaseURL = () => {
  // ВАЖНО: Сначала проверяем hostname (самый надежный способ)
  // Это гарантирует, что в production всегда используется относительный путь
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // В production (не localhost, не 127.0.0.1, не туннель) всегда используем относительный путь
    if (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.includes('loca.lt')) {
      // Используем относительный путь - nginx проксирует /api/ на backend
      console.log('🌐 Production mode detected:', hostname, '- Using relative path /api/');
      return '/api/';
    }
    
    // Если фронтенд доступен через туннель localtunnel
    if (hostname.includes('loca.lt')) {
      if (BACKEND_TUNNEL_SUBDOMAIN && BACKEND_TUNNEL_SUBDOMAIN !== 'your-backend-subdomain') {
        return `https://${BACKEND_TUNNEL_SUBDOMAIN}.loca.lt/api/`;
      }
      console.warn('⚠️ Backend tunnel subdomain not configured. Using localhost (may not work through tunnel)');
      return 'http://localhost:8000/api/';
    }
  }
  
  // Только для localhost проверяем переменную окружения VITE_API_URL
  const viteApiUrl = import.meta.env.VITE_API_URL;
  if (viteApiUrl && viteApiUrl.trim() !== '' && viteApiUrl !== 'undefined') {
    const url = viteApiUrl.trim();
    // Дополнительная защита: если в переменной localhost, но мы не на localhost - игнорируем
    if (url.includes('localhost') && typeof window !== 'undefined' && 
        window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      console.warn('⚠️ VITE_API_URL contains localhost but we are in production, using relative path instead');
      return '/api/';
    }
    return url.endsWith('/') 
      ? url + 'api/'
      : url + '/api/';
  }
  
  // Локальная разработка (только если мы действительно на localhost)
  console.log('🏠 Local development mode: Using http://localhost:8000/api/');
  return 'http://localhost:8000/api/';
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

const baseURL = getApiBaseURL();
console.log('📡 API Base URL:', baseURL, '| Hostname:', typeof window !== 'undefined' ? window.location.hostname : 'N/A');

const api = axios.create({
  baseURL: baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh');
        if (refreshToken) {
          const refreshURL = getApiBaseURL() + 'users/token/refresh/';
          const response = await axios.post(refreshURL, {
            refresh: refreshToken
          });
          
          localStorage.setItem('access', response.data.access);
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;