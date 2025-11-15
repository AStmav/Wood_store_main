import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext.jsx';
import Layout from '../components/Layout.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import CheckoutModal from '../components/CheckoutModal.jsx';
import OrderSuccessModal from '../components/OrderSuccessModal.jsx';
import { formatPrice } from '../utils/format.js';

export default function Cart() {
  const { cart, loading, updateCartItem, removeFromCart, clearCart } = useCart();
  const [updating, setUpdating] = useState({});
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState({ visible: false, orderNumber: null });

  useEffect(() => {
    // Корзина загружается автоматически через контекст
  }, []);

  const handleQuantityChange = async (itemUuid, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating(prev => ({ ...prev, [itemUuid]: true }));
    await updateCartItem(itemUuid, newQuantity);
    setUpdating(prev => ({ ...prev, [itemUuid]: false }));
  };

  const handleRemoveItem = async (itemUuid) => {
    setUpdating(prev => ({ ...prev, [itemUuid]: true }));
    await removeFromCart(itemUuid);
    setUpdating(prev => ({ ...prev, [itemUuid]: false }));
  };

  const handleClearCart = async () => {
    if (window.confirm('Вы уверены, что хотите очистить корзину?')) {
      await clearCart();
    }
  };

  const handleCheckout = () => {
    setShowCheckoutModal(true);
  };

  const handleOrderCreated = async (orderData) => {
    await clearCart();
    setOrderSuccess({ visible: true, orderNumber: orderData?.order_number });
  };

  if (loading) return <LoadingSpinner />;

  const items = cart?.items || [];
  const hasItems = items.length > 0;

  const totalAmount = cart?.total_amount
    ? parseFloat(cart.total_amount)
    : items.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between.items-start gap-4 md:gap-0">
            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">🛒 Корзина</h1>
              <p className="text-sm md:text-base.text-gray-600">Ваши выбранные товары</p>
            </div>
            {hasItems && (
              <button
                onClick={handleClearCart}
                className="text-sm md:text-base text-red-600 hover:text-red-800 font-medium px-3 md:px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                🗑️ Очистить корзину
              </button>
            )}
          </div>

          {hasItems ? (
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="divide-y divide-gray-200">
                {items.map(item => (
                  <div key={item.uuid} className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center mdl:items-start md:flex-row gap-4 md:gap-6 w-full">
                        <img
                          src={item.product.image || '/placeholder-product.svg'}
                          alt={item.product.name}
                          className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-xl shadow-sm"
                          onError={(e) => {
                            e.target.src = '/placeholder-product.svg';
                          }}
                        />
                        <div className="flex-1 space-y-1">
                          <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                            {item.product.name}
                          </h3>
                          <p className="text-sm md:text-lg text-gray-600 whitespace-nowrap">
                            {formatPrice(item.product.price)} ₽ за шт.
                          </p>
                          {item.product.category && (
                            <p className="text-xs md:text-sm text-blue-600">
                              {item.product.category.name}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 w-full md:w-auto">
                        <div className="flex items-center justify-between md:justify-start space-x-4">
                          <button
                            onClick={() => handleQuantityChange(item.uuid, item.quantity - 1)}
                            disabled={updating[item.uuid]}
                            className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 transition-colors"
                          >
                            <span className="text-base md:text-lg font-medium">-</span>
                          </button>
                          <span className="w-14 md:w-16 text-center font-semibold text-base md:text-lg">
                            {updating[item.uuid] ? '...' : item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.uuid, item.quantity + 1)}
                            disabled={updating[item.uuid]}
                            className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 transition-colors"
                          >
                            <span className="text-base md:text-lg font-medium">+</span>
                          </button>
                        </div>

                        <div className="text-left md:text-right w-full md:w-auto md:min-w-[120px]">
                          <p className="text-lg md:text-xl font-bold text-gray-900 whitespace-nowrap">
                            {formatPrice(item.total_price)} ₽
                          </p>
                          <p className="text-xs md:text-sm text-gray-500 whitespace-nowrap">
                            {item.quantity} × {formatPrice(item.product.price)} ₽
                          </p>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.uuid)}
                          disabled={updating[item.uuid]}
                          className="self-start text-red-600 hover:text-red-800 p-2.5 md:p-3 rounded-full hover:bg-red-50 transition-colors"
                          title="Удалить товар"
                        >
                          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-5 md:px-8 md:py-6 border-t border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xl md:text-2xl font-bold text-gray-900 whitespace-nowrap">
                      Итого: {formatPrice(totalAmount)} ₽
                    </p>
                    <p className="text-sm md:text-base text-gray-600">
                      {items.length} {items.length === 1 ? 'товар' : items.length < 5 ? 'товара' : 'товаров'}
                    </p>
                  </div>
                  <button 
                    onClick={handleCheckout}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 md:px-8 md:py-4 rounded-xl font-semibold text-base md:text-lg transition-all duration-200 shadow-md md:shadow-lg hover:shadow-lg md:hover:shadow-xl"
                  >
                    🛒 Оформить заказ
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg p-8 text-center space-y-6">
              <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex.items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold text-gray-900">🛒 Корзина пуста</h3>
                <p className="text-gray-600">Начните покупки, чтобы добавить товары в корзину.</p>
              </div>
              <a
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Перейти к покупкам
              </a>
            </div>
          )}
        </div>
      </div>
      
      {/* Модальное окно оформления заказа */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        cart={cart}
        onOrderCreated={handleOrderCreated}
      />
      <OrderSuccessModal
        isOpen={!!orderSuccess?.visible}
        orderNumber={orderSuccess?.orderNumber}
        onClose={() => setOrderSuccess({ visible: false, orderNumber: null })}
      />
    </Layout>
  );
}