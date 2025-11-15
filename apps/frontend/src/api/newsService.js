import api from './clients';

export const newsService = {
  // Получение всех новостей
  getNews: async (params = {}) => {
    const response = await api.get('news/', { params });
    return response.data;
  },

  // Получение активных новостей с лимитом
  getActiveNews: async (limit = 6) => {
    const response = await api.get(`news/active/?limit=${limit}`);
    return response.data;
  },

  // Получение новости по UUID
  getNewsById: async (uuid) => {
    const response = await api.get(`news/${uuid}/`);
    return response.data;
  },

  // Получение новости по slug
  getNewsBySlug: async (slug) => {
    console.log('Fetching news with slug:', slug);
    const response = await api.get(`news/slug/${slug}/`);
    console.log('News response:', response.data);
    return response.data;
  },

  // Поиск новостей
  searchNews: async (query) => {
    const response = await api.get('news/', { params: { search: query } });
    return response.data;
  }
}; 