import api from './clients';

export const aboutService = {
  // Получение активного раздела "О нас"
  getActiveAbout: async () => {
    const response = await api.get('about/active/');
    return response.data;
  },

  // Получение всех разделов "О нас"
  getAllAbout: async () => {
    const response = await api.get('about/');
    return response.data;
  },

  // Получение конкретного раздела по ID
  getAboutById: async (id) => {
    const response = await api.get(`about/${id}/`);
    return response.data;
  }
}; 