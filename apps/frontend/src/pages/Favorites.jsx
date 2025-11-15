import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoriteContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Layout from '../components/Layout.jsx';

export default function Favorites() {
  const { favorites, loading, toggleFavorite, fetchFavorites, initialized } = useFavorites();
  const { user } = useAuth();

  // Обновляем данные только при первом заходе на страницу и если данные еще не инициализированы
  useEffect(() => {
    if (!initialized) {
      fetchFavorites();
    }
  }, [initialized, fetchFavorites]);

  const handleRemoveFromFavorites = async (productUuid) => {
    try {
      const result = await toggleFavorite(productUuid);
      if (result.success) {
        console.log('Removed from favorites');
      } else {
        console.error('Failed to remove from favorites:', result.error);
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка избранного...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Заголовок */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Избранные товары
            </h1>
            <p className="text-lg text-gray-600">
              Ваши любимые товары в одном месте
            </p>
          </div>

          {/* Список избранных товаров */}
          {favorites.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Избранное пусто
              </h3>
              <p className="text-gray-600 mb-6">
                Добавьте товары в избранное, чтобы они отображались здесь
              </p>
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Перейти к покупкам
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {favorites.map((favorite) => (
                <div key={favorite.uuid} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200 group">
                  {/* Изображение товара */}
                  <div className="relative">
                    <Link to={`/product/${favorite.product.uuid}`}>
                      <img
                        src={favorite.product.image || '/placeholder-product.svg'}
                        alt={favorite.product.name}
                        className="w-full h-48 object-cover rounded-t-xl group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.target.src = '/placeholder-product.svg';
                        }}
                      />
                    </Link>
                    
                    {/* Кнопка удаления из избранного */}
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemoveFromFavorites(favorite.product.uuid);
                        }}
                        className="p-2 rounded-full shadow-md transition-all duration-200 hover:scale-110 bg-red-500 text-white hover:bg-red-600"
                        title="Удалить из избранного"
                      >
                        <svg className="w-5 h-5" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Информация о товаре */}
                  <div className="p-4">
                    <Link to={`/product/${favorite.product.uuid}`}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {favorite.product.name}
                      </h3>
                    </Link>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {favorite.product.description}
                    </p>

                    {/* Цена */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl font-bold text-gray-900">
                        {favorite.product.price} ₽
                      </span>
                      {favorite.product.rating && (
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-400">⭐</span>
                          <span className="text-sm text-gray-600">
                            {favorite.product.rating}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Кнопка "Подробнее" */}
                    <div className="mt-4">
                      <Link
                        to={`/product/${favorite.product.uuid}`}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center block"
                      >
                        Подробнее
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Статистика */}
          {favorites.length > 0 && (
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Всего избранных товаров: <span className="font-semibold text-gray-900">{favorites.length}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
