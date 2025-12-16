import axios from 'axios';

// Определяем базовый URL API из переменных окружения
// Для production: не указывайте VITE_API_URL (будет использован относительный путь)
// Для development: установите VITE_API_URL=http://localhost:8000 в .env
const getApiBaseURL = () => {
  // Если указана переменная окружения VITE_API_URL, используем её
  const viteApiUrl = import.meta.env.VITE_API_URL;
  
  // DEBUG: логируем для отладки
  console.log('🔍 VITE_API_URL from env:', viteApiUrl);
  
  if (viteApiUrl && viteApiUrl.trim() !== '' && viteApiUrl !== 'undefined') {
    const url = viteApiUrl.trim();
    const result = url.endsWith('/') ? url + 'api/' : url + '/api/';
    console.log('🔍 Using VITE_API_URL:', result);
    return result;
  }
  
  // Для туннеля localtunnel
  const tunnelSubdomain = import.meta.env.VITE_BACKEND_TUNNEL_SUBDOMAIN;
  if (tunnelSubdomain && tunnelSubdomain !== 'your-backend-subdomain') {
    const result = `https://${tunnelSubdomain}.loca.lt/api/`;
    console.log('🔍 Using tunnel:', result);
    return result;
  }
  
  // По умолчанию: относительный путь (production)
  // Браузер автоматически добавит текущий домен
  console.log('🔍 Using relative path: /api/');
  return '/api/';
};

const baseURL = getApiBaseURL();
console.log('📡 FINAL API Base URL:', baseURL);
console.log('📡 Current URL:', typeof window !== 'undefined' ? window.location.href : 'N/A');

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