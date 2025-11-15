import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { favoriteService } from '../api/favoriteService';
import { useAuth } from './AuthContext';

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
  const { user } = useAuth();

  // Загрузка избранных товаров
  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const response = await favoriteService.getFavoritesDetails();
      setFavorites(response.data || []);
      setFavoritesCount((response.data || []).length);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setFavorites([]);
      setFavoritesCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Добавление/удаление товара из избранного
  const toggleFavorite = async (productId) => {
    try {
      setLoading(true);
      const response = await favoriteService.toggleFavorite(productId);
      
      // Обновляем список избранного после изменения
      await fetchFavorites();
      
      return { success: true, isFavorite: response.status === 201 };
    } catch (err) {
      console.error('Error toggling favorite:', err);
      return { success: false, error: 'Ошибка изменения избранного' };
    } finally {
      setLoading(false);
    }
  };

  // Проверка, находится ли товар в избранном
  const isFavorite = (productId) => {
    return favorites.some(fav => fav.product.uuid === productId);
  };

  // Синхронизация локальных избранных с сервером при входе пользователя
  const syncLocalFavorites = useCallback(async () => {
    if (user) {
      try {
        const response = await favoriteService.syncLocalToServer();
        console.log('Synced local favorites:', response.data);
        // Обновляем список избранного после синхронизации
        await fetchFavorites();
      } catch (error) {
        console.error('Error syncing local favorites:', error);
      }
    }
  }, [user, fetchFavorites]);

  // Загружаем избранное при изменении пользователя
  useEffect(() => {
    if (user && !initialized) {
      // Сначала синхронизируем локальные данные, затем загружаем с сервера
      syncLocalFavorites().then(() => {
        fetchFavorites();
        setInitialized(true);
      });
    } else if (!user && initialized) {
      setFavorites([]);
      setFavoritesCount(0);
      setInitialized(false);
    }
  }, [user, initialized, fetchFavorites, syncLocalFavorites]);

  const value = {
    favorites,
    favoritesCount,
    loading,
    initialized,
    fetchFavorites,
    toggleFavorite,
    isFavorite,
    syncLocalFavorites,
  };

  return (
    <FavoriteContext.Provider value={value}>
      {children}
    </FavoriteContext.Provider>
  );
};

// Экспорт для Vite HMR
FavoriteProvider.displayName = 'FavoriteProvider';
export { FavoriteProvider };