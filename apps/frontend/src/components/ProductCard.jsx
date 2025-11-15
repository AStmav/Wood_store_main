import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useFavorites } from '../context/FavoriteContext.jsx';
import FavoritePromptModal from './FavoritePromptModal.jsx';
import { formatPrice } from '../utils/format.js';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toggleFavorite, isFavorite, loading } = useFavorites();
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [showFavoriteModal, setShowFavoriteModal] = useState(false);
  const [showMessage, setShowMessage] = useState(null);

  const handleAddToCart = async () => {
    const result = await addToCart(product.uuid, 1);
    console.log('Add to cart result:', result);
    if (result.success) {
      setShowMessage('Товар добавлен в корзину');
    } else {
      console.error('Failed to add to cart:', result.error);
      setShowMessage(result.error || 'Не удалось добавить товар в корзину');
    }
  };

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Если пользователь не зарегистрирован, показываем модальное окно
    if (!user) {
      setShowFavoriteModal(true);
      return;
    }

    if (isFavoriteLoading) {
      return;
    }

    try {
      setIsFavoriteLoading(true);
      const result = await toggleFavorite(product.uuid);
      if (result.success) {
        console.log(result.isFavorite ? 'Added to favorites' : 'Removed from favorites');
      } else {
        console.error('Failed to toggle favorite:', result.error);
      }
    } catch (error) {
      console.error('Error in handleToggleFavorite:', error);
    } finally {
      setIsFavoriteLoading(false);
    }
  };



  return (
    <>
      <div className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group h-full flex flex-col w-full">
      <Link to={`/product/${product.uuid}`} className="block flex-1 flex flex-col">
        <div className="relative overflow-hidden w-full" style={{ aspectRatio: '16/9' }}>
          <img 
            src={product.image || '/placeholder-product.svg'} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = '/placeholder-product.svg';
            }}
          />
          
                 {/* Кнопка избранного */}
                 <div className="absolute top-2 right-2">
                   <button
                     onClick={handleToggleFavorite}
                     disabled={isFavoriteLoading}
                     className={`p-2 rounded-full shadow-md transition-all duration-200 ${
                       isFavoriteLoading 
                         ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                         : user && isFavorite(product.uuid)
                           ? 'bg-red-500 text-white hover:bg-red-600 hover:scale-110'
                           : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500 hover:scale-110'
                     }`}
                     title={
                       isFavoriteLoading 
                         ? 'Загрузка...' 
                         : user 
                           ? (isFavorite(product.uuid) ? 'Удалить из избранного' : 'Добавить в избранное')
                           : 'Войдите в аккаунт для добавления в избранное'
                     }
                   >
                     {isFavoriteLoading ? (
                       <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                       </svg>
                     ) : (
                       <svg className="w-5 h-5" fill={user && isFavorite(product.uuid) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                       </svg>
                     )}
                   </button>
                 </div>
          
          {/* Рейтинг */}
          <div className="absolute top-2 left-2">
            {product.rating && (
              <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold">
                ⭐ {product.rating} Рейтинг
              </div>
            )}
          </div>
          
          {/* Индикатор наличия на изображении */}
          {product.available !== undefined && (
            <div className="absolute bottom-2 left-2">
              {product.available ? (
                <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                  ✅ В наличии
                </div>
              ) : (
                <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                  ❌ Нет
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Контент карточки с фиксированной высотой */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Название товара - фиксированная высота */}
          <div className="h-12 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
              {product.name}
            </h3>
          </div>
        
          {/* Категория - фиксированная высота */}
          <div className="h-5 mb-2">
            {product.category && (
              <p className="text-sm text-blue-600">
                {product.category.name}
              </p>
            )}
          </div>
        
          {/* Описание - фиксированная высота */}
          <div className="h-10 mb-3">
            {product.description && (
              <p className="text-gray-600 text-sm line-clamp-2">
                {product.description}
              </p>
            )}
          </div>
          
          {/* Цена и статус - фиксированная высота */}
          <div className="h-16 flex flex-col justify-between">
            {/* Цена */}
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-gray-900 whitespace-nowrap">
                {formatPrice(product.price)} ₽
              </span>
            </div>
            
            {/* Статус наличия */}
            {product.available !== undefined && (
              <div className="flex items-center">
                {product.available ? (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-700">
                      В наличии
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium text-red-700">
                      Нет в наличии
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
      
      {/* Кнопка "В корзину" - всегда внизу */}
      <div className="p-4 pt-0 mt-auto">
        <button
          onClick={handleAddToCart}
          disabled={!product.available}
          className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1 ${
            product.available 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
          </svg>
          <span>
            {product.available ? 'В корзину' : 'Нет в наличии'}
          </span>
        </button>
      </div>
    </div>
    
    {/* Модальное окно для незарегистрированных пользователей */}
    <FavoritePromptModal 
      isOpen={showFavoriteModal} 
      onClose={() => setShowFavoriteModal(false)} 
    />
    
    {/* Модальное окно для корзины незарегистрированных пользователей */}
    {showMessage && (
      <div className="fixed bottom-6 inset-x-0 flex justify-center z-50">
        <div className="bg-white shadow-lg px-4 py-3 rounded-lg text-gray-800 flex items-center space-x-3">
          <span>{showMessage}</span>
          <button
            onClick={() => setShowMessage(null)}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Закрыть уведомление"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    )}
    </>
  );
}
