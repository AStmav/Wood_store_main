import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService } from '../api/productService.js';
import Layout from '../components/Layout.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useFavorites } from '../context/FavoriteContext.jsx';
import LoginPromptModal from '../components/LoginPromptModal.jsx';
import { formatPrice } from '../utils/format.js';
import { trackProductView } from '../api/analytics.js';

const ProductDetail = () => {
  const { uuid } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Loading product with uuid:', uuid);
        const data = await productService.getProductById(uuid);
        console.log('Product data received:', data);
        setProduct(data);
      } catch (err) {
        console.error('Error loading product:', err);
        if (err.response?.status === 404) {
          setError('Товар не найден');
        } else if (err.response?.status >= 500) {
          setError('Ошибка сервера. Попробуйте позже.');
        } else if (err.code === 'NETWORK_ERROR' || !err.response) {
          setError('Ошибка сети. Проверьте подключение к интернету.');
        } else {
          setError('Не удалось загрузить товар');
        }
      } finally {
        setLoading(false);
      }
    };

    if (uuid) {
      loadProduct();
    }
  }, [uuid]);

  useEffect(() => {
    if (product?.uuid) {
      trackProductView(product.uuid, { path: window.location.pathname });
    }
  }, [product?.uuid]);

  const handleAddToCart = async () => {
    console.log('Adding to cart:', product.uuid, product.name, quantity);
    const result = await addToCart(product.uuid, quantity);
    console.log('Add to cart result:', result);
    if (result.success) {
      console.log('Successfully added to cart');
      // Можно добавить уведомление об успехе
    } else {
      console.error('Failed to add to cart:', result.error);
      // Можно добавить уведомление об ошибке
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    try {
      const result = await toggleFavorite(product.uuid);
      if (result.success) {
        console.log(result.isFavorite ? 'Added to favorites' : 'Removed from favorites');
      } else {
        console.error('Failed to toggle favorite:', result.error);
      }
    } catch (error) {
      console.error('Error in handleToggleFavorite:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!product) {
    return <ErrorMessage message="Товар не найден" />;
  }

  return (
    <Layout>
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Хлебные крошки */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
              <li>
                <Link to="/" className="hover:text-blue-600 transition-colors">
                  Главная
                </Link>
              </li>
              <li>
                <span className="mx-2">/</span>
              </li>
              <li>
                <Link to="/" className="hover:text-blue-600 transition-colors">
                  Каталог
                </Link>
              </li>
              {product.category && (
                <>
                  <li>
                    <span className="mx-2">/</span>
                  </li>
                  <li className="text-gray-900 font-medium">
                    {product.category.name}
                  </li>
                </>
              )}
              <li>
                <span className="mx-2">/</span>
              </li>
              <li className="text-gray-900 font-medium">
                {product.name}
              </li>
            </ol>
          </nav>

          {/* Основной контент */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Изображение товара */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src={product.image || '/placeholder-product.svg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder-product.svg';
                  }}
                />
              </div>
            </div>

            {/* Информация о товаре */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                {product.category && (
                  <p className="text-lg text-blue-600 mb-4">
                    {product.category.name}
                  </p>
                )}
                <div className="flex items-center space-x-2 mb-4">
                  {product.rating ? (
                    <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
                      ⭐ {product.rating} Рейтинг
                    </div>
                  ) : (
                    <div className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm font-semibold">
                      📊 Рейтинг не указан
                    </div>
                  )}
                </div>
              </div>

              {/* Описание */}
              {product.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Описание</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Характеристики */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Характеристики</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center border-b border-gray-200 pb-3 last:border-0">
                        <span className="text-gray-600 font-medium">{key}:</span>
                        <span className="text-gray-900 font-semibold">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Цена и добавление в корзину */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-3xl font-bold text-gray-900 whitespace-nowrap">
                      {formatPrice(product.price)} ₽
                    </span>
                    {product.available !== undefined && (
                      <div className="text-sm text-gray-500 mt-1">
                        {product.available ? (
                          <span className="text-green-600">
                            В наличии
                          </span>
                        ) : (
                          <span className="text-red-600">
                            Нет в наличии
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                      Количество:
                    </label>
                    <input
                      id="quantity"
                      type="number"
                      min="1"
                      max={product.stock_quantity || 10}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center"
                    />
                  </div>
                </div>

                {/* Кнопки действий */}
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.available}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg text-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                    </svg>
                    <span>
                      {product.available ? 'В корзину' : 'Нет в наличии'}
                    </span>
                  </button>
                  
                  <button
                    onClick={handleToggleFavorite}
                    className={`px-6 py-3 rounded-lg text-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 border-2 ${
                      isFavorite(product.uuid)
                        ? 'bg-red-500 text-white border-red-500 hover:bg-red-600'
                        : 'bg-white text-red-500 border-red-500 hover:bg-red-50'
                    }`}
                    title={isFavorite(product.uuid) ? 'Удалить из избранного' : 'Добавить в избранное'}
                  >
                    <svg className="w-5 h-5" fill={isFavorite(product.uuid) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>
                      {isFavorite(product.uuid) ? 'В избранном' : 'В избранное'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Кнопка "Назад к каталогу" */}
          <div className="mt-8 text-center">
            <Link 
              to="/"
              className="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Назад к каталогу
            </Link>
          </div>
        </div>
      </div>

      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        productName={product?.name || 'товар'}
      />
    </Layout>
  );
};

export default ProductDetail;
