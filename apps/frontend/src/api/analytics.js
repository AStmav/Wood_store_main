import api from './clients.js';

export const trackProductView = async (productUuid, options = {}) => {
  if (!productUuid) return;

  try {
    await api.post('analytics/product-views/', {
      product: productUuid,
      path: options.path,
      referrer: options.referrer,
    });
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Не удалось отправить данные просмотра товара', error);
    }
  }
};

export const trackSiteVisit = async (path) => {
  if (!path) return;

  try {
    await api.post('analytics/site-visits/', {
      path,
    });
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Не удалось отправить данные посещения', error);
    }
  }
};


