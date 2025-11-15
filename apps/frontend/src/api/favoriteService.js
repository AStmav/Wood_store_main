import api from './clients';

// Кеш для предотвращения множественных запросов
const requestCache = new Map();
const CACHE_DURATION = 5000; // 5 секунд

// Генерируем уникальный session_id для гостевых пользователей
const getSessionId = () => {
  let sessionId = localStorage.getItem('guest_session_id');
  if (!sessionId) {
    sessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('guest_session_id', sessionId);
  }
  return sessionId;
};

// Проверка кеша
const getCachedRequest = (key) => {
  const cached = requestCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

// Сохранение в кеш
const setCachedRequest = (key, data) => {
  requestCache.set(key, {
    data,
    timestamp: Date.now()
  });
};

// Очистка кеша для конкретного пользователя
const clearUserCache = (sessionId) => {
  const keysToDelete = [];
  for (const key of requestCache.keys()) {
    if (key.includes(sessionId)) {
      keysToDelete.push(key);
    }
  }
  keysToDelete.forEach(key => requestCache.delete(key));
};

// Получаем избранное из localStorage для гостей
const getLocalFavorites = () => {
  try {
    const favorites = localStorage.getItem('guest_favorites');
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Error parsing local favorites:', error);
    return [];
  }
};

// Сохраняем избранное в localStorage для гостей
const setLocalFavorites = (favorites) => {
  try {
    localStorage.setItem('guest_favorites', JSON.stringify(favorites));
  } catch (error) {
    console.error('Error saving local favorites:', error);
  }
};

export const favoriteService = {
  // Получить список UUID избранных товаров (быстро)
  getFavoritesUuids: async () => {
    try {
      const response = await api.get('/orders/favorites-new/list/', {
        headers: {
          'X-Session-ID': getSessionId()
        }
      });
      return response;
    } catch (error) {
      // Если API недоступен, возвращаем локальные данные для гостей
      console.warn('API недоступен, используем локальные данные');
      return {
        data: {
          favorite_uuids: getLocalFavorites()
        }
      };
    }
  },
  
  // Получить детали избранных товаров (медленно, но с полной информацией)
  getFavoritesDetails: async () => {
    const sessionId = getSessionId();
    
    // Для гостевых пользователей НЕ делаем API запросы
    if (sessionId.startsWith('guest_')) {
      console.log('Guest user - returning empty data for getFavoritesDetails');
      return { data: [] };
    }
    
    const cacheKey = `favorites_details_${sessionId}`;
    
    // Проверяем кеш
    const cached = getCachedRequest(cacheKey);
    if (cached) {
      console.log('Using cached favorites details');
      return cached;
    }
    
    try {
      const response = await api.get('/orders/favorites-new/details/', {
        headers: {
          'X-Session-ID': sessionId
        }
      });
      
      // Сохраняем в кеш
      setCachedRequest(cacheKey, response);
      
      return response;
    } catch (error) {
      // Если API недоступен, возвращаем пустой массив
      console.warn('API недоступен для деталей избранного');
      const fallbackResponse = { data: [] };
      setCachedRequest(cacheKey, fallbackResponse);
      return fallbackResponse;
    }
  },
  
  // Добавить товар в избранное
  addFavorite: async (productUuid) => {
    try {
      const response = await api.post('/orders/favorites-new/add/', 
        { product_id: productUuid },
        {
          headers: {
            'X-Session-ID': getSessionId()
          }
        }
      );
      return response;
    } catch (error) {
      // Если API недоступен, добавляем в локальное хранилище
      console.warn('API недоступен, добавляем в локальное хранилище');
      const localFavorites = getLocalFavorites();
      if (!localFavorites.includes(productUuid)) {
        localFavorites.push(productUuid);
        setLocalFavorites(localFavorites);
      }
      return { status: 201, data: { message: 'Товар добавлен в избранное' } };
    }
  },
  
  // Удалить товар из избранного
  removeFavorite: async (productUuid) => {
    try {
      const response = await api.post('/orders/favorites-new/remove/', 
        { product_id: productUuid },
        {
          headers: {
            'X-Session-ID': getSessionId()
          }
        }
      );
      return response;
    } catch (error) {
      // Если API недоступен, удаляем из локального хранилища
      console.warn('API недоступен, удаляем из локального хранилища');
      const localFavorites = getLocalFavorites();
      const updatedFavorites = localFavorites.filter(id => id !== productUuid);
      setLocalFavorites(updatedFavorites);
      return { status: 200, data: { message: 'Товар удален из избранного' } };
    }
  },
  
  // Получить количество избранных товаров
  getFavoritesCount: async () => {
    try {
      const response = await api.get('/orders/favorites-new/count/', {
        headers: {
          'X-Session-ID': getSessionId()
        }
      });
      return response;
    } catch (error) {
      // Если API недоступен, считаем локальные данные
      console.warn('API недоступен, считаем локальные данные');
      const localFavorites = getLocalFavorites();
      return { data: { count: localFavorites.length } };
    }
  },
  
  // Проверить, находится ли товар в избранном
  isFavorite: async (productUuid) => {
    try {
      const response = await favoriteService.getFavoritesUuids();
      return response.data.favorite_uuids.includes(productUuid);
    } catch (error) {
      console.error('Error checking favorite status:', error);
      // Fallback к локальным данным
      const localFavorites = getLocalFavorites();
      return localFavorites.includes(productUuid);
    }
  },
  
  // Переключить статус избранного (удобный метод)
  toggleFavorite: async (productUuid) => {
    const sessionId = getSessionId();
    
    try {
      const isFav = await favoriteService.isFavorite(productUuid);
      
      // Очищаем кеш перед изменением
      clearUserCache(sessionId);
      
      if (isFav) {
        return await favoriteService.removeFavorite(productUuid);
      } else {
        return await favoriteService.addFavorite(productUuid);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  },

  // Синхронизация локальных избранных с сервером при входе пользователя
  syncLocalToServer: async () => {
    try {
      const localFavorites = getLocalFavorites();
      if (localFavorites.length > 0) {
        const response = await api.post('/orders/favorites/sync-from-local/', {
          favorites: localFavorites
        });
        
        // Очищаем локальные данные после успешной синхронизации
        localStorage.removeItem('guest_favorites');
        localStorage.removeItem('guest_session_id');
        
        return response;
      }
      return { data: { message: 'Нет данных для синхронизации' } };
    } catch (error) {
      console.error('Error syncing local favorites:', error);
      throw error;
    }
  }
};
