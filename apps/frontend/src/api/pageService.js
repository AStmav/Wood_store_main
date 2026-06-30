import axios from '../api/clients.js';

export const pageService = {
  async getBySlug(slug) {
    const { data } = await axios.get(`/pages/slug/${slug}/`);
    return data;
  },

  async getSiteConfig() {
    const { data } = await axios.get('/pages/site_config/');
    return data;
  },
};
