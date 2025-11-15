import api from './clients';

// Кеш для фильтров
let filtersCache = null;
let filtersCacheTimestamp = null;
const FILTERS_CACHE_DURATION = 300000; // 5 минут

export const productService = {
  // Получение всех продуктов с фильтрацией
  getProducts: async (params = {}) => {
    const response = await api.get('catalog/products/', { params });
    return response.data;
  },

  // Расширенный поиск продуктов
  searchProducts: async (params = {}) => {
    const response = await api.get('catalog/products/search/', { params });
    return response.data;
  },

  // Получение доступных фильтров с кешированием
  getFilters: async () => {
    const now = Date.now();
    
    // Проверяем кеш
    if (filtersCache && filtersCacheTimestamp && (now - filtersCacheTimestamp) < FILTERS_CACHE_DURATION) {
      console.log('Using cached filters');
      return filtersCache;
    }
    
    console.log('Fetching filters from API');
    const response = await api.get('catalog/products/filters/');
    
    // Сохраняем в кеш
    filtersCache = response.data;
    filtersCacheTimestamp = now;
    
    return response.data;
  },

  // Получение продукта по ID
  getProduct: async (uuid) => {
    const response = await api.get(`catalog/products/${uuid}/`);
    return response.data;
  },

  // Алиас для совместимости
  getProductById: async (uuid) => {
    const response = await api.get(`catalog/products/${uuid}/`);
    return response.data;
  },

  // Получение категорий
  getCategories: async () => {
    const response = await api.get('catalog/categories/');
    return response.data;
  },

  // Получение продуктов категории
  getCategoryProducts: async (categoryUuid) => {
    const response = await api.get(`catalog/categories/${categoryUuid}/products/`);
    return response.data;
  },

  // Получение хитов продаж на основе рейтинга
  getBestsellers: async (minRating = 4.0, limit = 6) => {
    const response = await api.get('catalog/products/bestsellers/', {
      params: { min_rating: minRating, limit }
    });
    return response.data;
  }
};

// Функция для построения параметров поиска
export const buildSearchParams = (searchTerm, filters) => {
  const params = {};

  if (searchTerm) {
    params.search = searchTerm;
  }

  if (filters.category) {
    params.category = filters.category;
  }

  if (filters.minPrice) {
    params.min_price = filters.minPrice;
  }

  if (filters.maxPrice) {
    params.max_price = filters.maxPrice;
  }

  if (filters.availableOnly) {
    params.available_only = 'true';
  }

  if (filters.popularOnly) {
    params.popular_only = 'true';
  }

  if (filters.ordering) {
    params.ordering = filters.ordering;
  }

  return params;
}; 