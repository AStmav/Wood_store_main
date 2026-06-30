import { productService } from './productService';

const getLocalFavorites = () => {
  try {
    const favorites = localStorage.getItem('guest_favorites');
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Error parsing local favorites:', error);
    return [];
  }
};

const setLocalFavorites = (favorites) => {
  try {
    localStorage.setItem('guest_favorites', JSON.stringify(favorites));
  } catch (error) {
    console.error('Error saving local favorites:', error);
  }
};

export const favoriteService = {
  getFavoritesDetails: async () => {
    const uuids = getLocalFavorites();
    if (!uuids.length) {
      return { data: [] };
    }

    const products = await Promise.all(
      uuids.map((uuid) => productService.getProductById(uuid).catch(() => null)),
    );

    return {
      data: products
        .filter(Boolean)
        .map((product) => ({ product })),
    };
  },

  addFavorite: async (productUuid) => {
    const localFavorites = getLocalFavorites();
    if (!localFavorites.includes(productUuid)) {
      localFavorites.push(productUuid);
      setLocalFavorites(localFavorites);
    }
    return { status: 201, data: { message: 'Товар добавлен в избранное' } };
  },

  removeFavorite: async (productUuid) => {
    const updatedFavorites = getLocalFavorites().filter((id) => id !== productUuid);
    setLocalFavorites(updatedFavorites);
    return { status: 200, data: { message: 'Товар удален из избранного' } };
  },

  isFavorite: async (productUuid) => getLocalFavorites().includes(productUuid),

  toggleFavorite: async (productUuid) => {
    const isFav = getLocalFavorites().includes(productUuid);
    if (isFav) {
      return favoriteService.removeFavorite(productUuid);
    }
    return favoriteService.addFavorite(productUuid);
  },
};
