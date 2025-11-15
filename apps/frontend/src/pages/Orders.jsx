import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrderContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getStatusColor, getStatusLabel, getStatusDescription, getUserActions } from '../services/orderStatusService.js';
import Layout from '../components/Layout.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { formatPrice } from '../utils/format.js';

export default function Orders() {
  const navigate = useNavigate();
  const { orders, loading, error, fetchOrders } = useOrders();
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const { user } = useAuth();


  const toggleOrderExpansion = (orderUuid) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderUuid)) {
      newExpanded.delete(orderUuid);
    } else {
      newExpanded.add(orderUuid);
    }
    setExpandedOrders(newExpanded);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchOrders} />;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Мои заказы</h1>
            <p className="text-gray-600">История ваших покупок</p>
            {!user && (
              <p className="mt-3 text-sm text-gray-500">
                Вы не авторизованы. Если вы оформили заказ как гость, дождитесь звонка менеджера — он подтвердит детали по указанному номеру телефона.
              </p>
            )}
          </div>
        
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Заказов пока нет</h3>
              <p className="text-gray-600 mb-6">Начните покупки, чтобы увидеть здесь свои заказы.</p>
              <a 
                href="/" 
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Перейти к покупкам
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => {
                const isExpanded = expandedOrders.has(order.uuid);
                const itemsCount = order.items ? order.items.length : 0;
                
                return (
                  <div key={order.uuid} className="bg-white shadow-lg rounded-lg overflow-hidden">
                    {/* Краткая информация о заказе */}
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Заказ {order.order_number}
                          </h3>
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <span>
                              {new Date(order.created_at).toLocaleDateString('ru-RU', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                            <span>{itemsCount} товар{itemsCount === 1 ? '' : itemsCount < 5 ? 'а' : 'ов'}</span>
                            {order.total_amount && (
                              <span className="font-bold text-gray-900 whitespace-nowrap">
                                {formatPrice(order.total_amount)} ₽
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                          <button
                            onClick={() => toggleOrderExpansion(order.uuid)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            {isExpanded ? 'Скрыть детали' : 'Подробнее'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Детальная информация (показывается при развертывании) */}
                    {isExpanded && (
                      <div className="border-t bg-gray-50 p-6">
                        {/* Информация о статусе */}
                        <div className="mb-6 p-4 bg-white rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm">
                            {getStatusDescription(order.status)}
                          </p>
                          
                          {/* Действия пользователя */}
                          {getUserActions(order.status).length > 0 && (
                            <div className="mt-3 flex space-x-2">
                              {getUserActions(order.status).map((action, index) => (
                                <button
                                  key={index}
                                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                    action.color === 'red' 
                                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                      : action.color === 'blue'
                                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                                  }`}
                                >
                                  {action.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {order.address && (
                          <div className="mb-6 p-4 bg-white rounded-lg">
                            <p className="text-gray-700">
                              <span className="font-semibold">Адрес доставки:</span> {order.address}
                            </p>
                          </div>
                        )}

                        {order.items && Array.isArray(order.items) && order.items.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Товары в заказе:</h4>
                            <div className="space-y-3">
                              {order.items.map(item => (
                                <div key={item.uuid} className="flex items-center justify-between p-4 bg-white rounded-lg">
                                  <div className="flex items-center space-x-4">
                                    <img
                                      src={item.product.image || '/placeholder-product.svg'}
                                      alt={item.product.name}
                                      className="w-16 h-16 object-cover rounded-lg shadow-sm"
                                      onError={(e) => {
                                        e.target.src = '/placeholder-product.svg';
                                      }}
                                    />
                                    <div>
                                      <h5 className="text-lg font-semibold text-gray-900">{item.product.name}</h5>
                                      <p className="text-gray-600">Количество: {item.quantity} шт.</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xl font-bold text-gray-900 whitespace-nowrap">
                                      {formatPrice(item.total_price)} ₽
                                    </p>
                                    <p className="text-sm text-gray-500 whitespace-nowrap">
                                      {item.quantity} × {formatPrice(item.product.price)} ₽
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {order.total_amount && (
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="text-xl font-bold text-gray-900">Итого к оплате:</span>
                              <span className="text-2xl font-bold text-gray-900 whitespace-nowrap">
                                {formatPrice(order.total_amount)} ₽
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}