import api from './clients';

// Кеш для фильтров
let filtersCache = null;
let filtersCacheTimestamp = null;
const FILTERS_CACHE_DURATION = 300000; // 5 минут

/** Нормализует ответ DRF PageNumberPagination. */
export function normalizeProductPage(data) {
  if (Array.isArray(data)) {
    return {
      results: data,
      count: data.length,
      next: null,
    };
  }

  return {
    results: data?.results || [],
    count: typeof data?.count === 'number' ? data.count : (data?.results || []).length,
    next: data?.next || null,
  };
}

export const productService = {
  getProducts: async (params = {}) => {
    const response = await api.get('catalog/products/', { params });
    return normalizeProductPage(response.data);
  },

  searchProducts: async (params = {}) => {
    const response = await api.get('catalog/products/search/', { params });
    return normalizeProductPage(response.data);
  },

  getFilters: async () => {
    const now = Date.now();

    if (filtersCache && filtersCacheTimestamp && (now - filtersCacheTimestamp) < FILTERS_CACHE_DURATION) {
      console.log('Using cached filters');
      return filtersCache;
    }

    console.log('Fetching filters from API');
    const response = await api.get('catalog/products/filters/');

    filtersCache = response.data;
    filtersCacheTimestamp = now;

    return response.data;
  },

  getProduct: async (uuid) => {
    const response = await api.get(`catalog/products/${uuid}/`);
    return response.data;
  },

  getProductById: async (uuid) => {
    const response = await api.get(`catalog/products/${uuid}/`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('catalog/categories/tree/');
    return response.data;
  },

  getCategoryFilters: async (categoryUuid) => {
    const response = await api.get(`catalog/categories/${categoryUuid}/filters/`);
    return response.data;
  },

  /** Одна страница товаров категории (подкатегории включены на бэкенде). */
  getCategoryProducts: async (categoryUuid, params = {}) => {
    const response = await api.get(`catalog/categories/${categoryUuid}/products/`, { params });
    return normalizeProductPage(response.data);
  },

  getFeaturedProducts: async (limit = 6) => {
    const response = await api.get('catalog/products/featured/', {
      params: { limit },
    });
    return response.data;
  },
};

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

  if (filters.ordering) {
    params.ordering = filters.ordering;
  }

  return params;
};
