import axios from 'axios';

// Конфигурация поддомена бэкенда для туннеля
const BACKEND_TUNNEL_SUBDOMAIN = import.meta.env.VITE_BACKEND_TUNNEL_SUBDOMAIN || 'your-backend-subdomain';

// Определяем базовый URL API в зависимости от окружения
// ВАРИАНТ 1 (РЕКОМЕНДУЕМЫЙ): Используем относительные пути для production
const getApiBaseURL = () => {
  // Проверяем hostname во время выполнения (runtime)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Production: используем относительный путь (best practice)
    if (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.includes('loca.lt')) {
      return '/api/'; // Относительный путь - браузер сам добавит домен
    }
    
    // Туннель localtunnel
    if (hostname.includes('loca.lt')) {
      if (BACKEND_TUNNEL_SUBDOMAIN && BACKEND_TUNNEL_SUBDOMAIN !== 'your-backend-subdomain') {
        return `https://${BACKEND_TUNNEL_SUBDOMAIN}.loca.lt/api/`;
      }
      return 'http://localhost:8000/api/';
    }
  }
  
  // Локальная разработка (localhost)
  return 'http://localhost:8000/api/';
};

const baseURL = getApiBaseURL();

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