import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyProducts } from '../context/MyProductsContext.jsx';
import { formatProductPrice } from '../utils/format.js';

export default function ProductCard({ product }) {
  const { addProduct, isInMyProducts, loading } = useMyProducts();
  const [isAdding, setIsAdding] = useState(false);
  const [showMessage, setShowMessage] = useState(null);

  const inMyProducts = isInMyProducts(product.uuid);

  const handleAddToMyProducts = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (inMyProducts || isAdding) {
      return;
    }

    try {
      setIsAdding(true);
      const result = await addProduct(product.uuid);
      if (result.success) {
        setShowMessage(result.alreadyAdded ? 'Товар уже в списке' : 'Товар добавлен в «Мои товары»');
      } else {
        setShowMessage(result.error || 'Не удалось добавить товар');
      }
    } finally {
      setIsAdding(false);
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

            {inMyProducts && (
              <div className="absolute top-2 right-2">
                <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                  В списке
                </span>
              </div>
            )}

            <div className="absolute top-2 left-2">
              {product.rating && (
                <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold">
                  ⭐ {product.rating} Рейтинг
                </div>
              )}
            </div>

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

          <div className="p-4 flex-1 flex flex-col">
            <div className="h-12 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                {product.name}
              </h3>
            </div>

            <div className="h-5 mb-2">
              {product.category && (
                <p className="text-sm text-blue-600">{product.category.name}</p>
              )}
            </div>

            <div className="h-10 mb-3">
              {product.description && (
                <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
              )}
            </div>

            <div className="h-16 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-gray-900 whitespace-nowrap">
                  {formatProductPrice(product)}
                </span>
              </div>

              {product.available !== undefined && (
                <div className="flex items-center">
                  {product.available ? (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-700">В наличии</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium text-red-700">Нет в наличии</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Link>

        <div className="p-4 pt-0 mt-auto">
          <button
            type="button"
            onClick={handleAddToMyProducts}
            disabled={!product.available || inMyProducts || isAdding || loading}
            className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1 ${
              inMyProducts
                ? 'bg-gray-100 text-gray-500 cursor-default'
                : product.available
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>
              {!product.available
                ? 'Нет в наличии'
                : inMyProducts
                  ? 'Уже в моих товарах'
                  : isAdding
                    ? 'Добавление...'
                    : 'В мои товары'}
            </span>
          </button>
        </div>
      </div>

      {showMessage && (
        <div className="fixed bottom-6 inset-x-0 flex justify-center z-50">
          <div className="bg-white shadow-lg px-4 py-3 rounded-lg text-gray-800 flex items-center space-x-3">
            <span>{showMessage}</span>
            <button
              type="button"
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
