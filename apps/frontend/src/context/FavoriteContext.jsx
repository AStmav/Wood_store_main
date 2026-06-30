import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { favoriteService } from '../api/favoriteService';

const FavoriteContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoriteContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoriteProvider');
  }
  return context;
};

const FavoriteProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const response = await favoriteService.getFavoritesDetails();
      const items = response.data || [];
      setFavorites(items);
      setFavoritesCount(items.length);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setFavorites([]);
      setFavoritesCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleFavorite = async (productId) => {
    try {
      setLoading(true);
      const response = await favoriteService.toggleFavorite(productId);
      await fetchFavorites();
      return { success: true, isFavorite: response.status === 201 };
    } catch (err) {
      console.error('Error toggling favorite:', err);
      return { success: false, error: 'Ошибка изменения избранного' };
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = (productId) => favorites.some((fav) => fav.product.uuid === productId);

  useEffect(() => {
    if (!initialized) {
      fetchFavorites().finally(() => setInitialized(true));
    }
  }, [initialized, fetchFavorites]);

  const value = {
    favorites,
    favoritesCount,
    loading,
    initialized,
    fetchFavorites,
    toggleFavorite,
    isFavorite,
  };

  return (
    <FavoriteContext.Provider value={value}>
      {children}
    </FavoriteContext.Provider>
  );
};

FavoriteProvider.displayName = 'FavoriteProvider';
export { FavoriteProvider };
