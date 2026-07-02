import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyProducts } from '../context/MyProductsContext.jsx';
import Layout from '../components/Layout.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import QuoteRequestModal from '../components/QuoteRequestModal.jsx';
import OrderSuccessModal from '../components/OrderSuccessModal.jsx';
import { formatProductPrice } from '../utils/format.js';

export default function MyProducts() {
  const { items, loading, removeProduct, clearProducts } = useMyProducts();
  const [updating, setUpdating] = useState({});
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState({ visible: false, orderNumber: null });

  const handleRemoveItem = async (itemUuid) => {
    setUpdating((prev) => ({ ...prev, [itemUuid]: true }));
    await removeProduct(itemUuid);
    setUpdating((prev) => ({ ...prev, [itemUuid]: false }));
  };

  const handleClearList = async () => {
    if (window.confirm('Очистить список товаров?')) {
      await clearProducts();
    }
  };

  const handleRequestCreated = async (orderData) => {
    await clearProducts();
    setRequestSuccess({ visible: true, orderNumber: orderData?.order_number });
  };

  if (loading && items.length === 0) {
    return <LoadingSpinner />;
  }

  const hasItems = items.length > 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Мои товары</h1>
              <p className="text-sm md:text-base text-gray-600">
                Список товаров, по которым вы хотите получить расчёт
              </p>
            </div>
            {hasItems && (
              <button
                type="button"
                onClick={handleClearList}
                className="text-sm md:text-base text-red-600 hover:text-red-800 font-medium px-3 md:px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                Очистить список
              </button>
            )}
          </div>

          {hasItems ? (
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={item.uuid} className="p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                      <img
                        src={item.product.image || '/placeholder-product.svg'}
                        alt={item.product.name}
                        className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-xl shadow-sm"
                        onError={(e) => {
                          e.target.src = '/placeholder-product.svg';
                        }}
                      />
                      <div className="flex-1 space-y-1">
                        <Link
                          to={`/product/${item.product.uuid}`}
                          className="text-lg md:text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        {item.product.category && (
                          <p className="text-xs md:text-sm text-blue-600">{item.product.category.name}</p>
                        )}
                        <p className="text-sm md:text-base text-gray-500">
                          {formatProductPrice(item.product)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.uuid)}
                        disabled={updating[item.uuid]}
                        className="self-start text-red-600 hover:text-red-800 p-2.5 rounded-full hover:bg-red-50 transition-colors"
                        title="Убрать из списка"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-5 md:px-8 md:py-6 border-t border-gray-200">
                <div className="flex flex-col gap-4">
                  <p className="text-sm md:text-base text-gray-600">
                    {items.length}{' '}
                    {items.length === 1 ? 'товар' : items.length < 5 ? 'товара' : 'товаров'} в списке.
                    Окончательная стоимость уточняется менеджером.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowQuoteModal(true)}
                    className="w-full md:w-auto self-start bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 md:px-8 md:py-4 rounded-xl font-semibold text-base md:text-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Запросить расчёт и связь
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg p-8 text-center space-y-6">
              <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold text-gray-900">Список пуст</h3>
                <p className="text-gray-600">
                  Добавьте товары из каталога, чтобы отправить запрос на расчёт менеджеру.
                </p>
              </div>
              <Link
                to="/"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Перейти в каталог
              </Link>
            </div>
          )}
        </div>
      </div>

      <QuoteRequestModal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        items={items}
        onRequestCreated={handleRequestCreated}
      />
      <OrderSuccessModal
        isOpen={!!requestSuccess?.visible}
        orderNumber={requestSuccess?.orderNumber}
        onClose={() => setRequestSuccess({ visible: false, orderNumber: null })}
      />
    </Layout>
  );
}
