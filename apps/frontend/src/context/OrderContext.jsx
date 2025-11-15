import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/clients.js';

const OrderContext = createContext();

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Загружаем заказы при инициализации (только один раз)
  useEffect(() => {
    if (!initialized) {
      // Добавляем задержку для стабилизации AuthContext
      const timer = setTimeout(() => {
        fetchOrders();
        setInitialized(true);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [initialized]);

  // Проверяем, есть ли токен перед загрузкой заказов
  const hasToken = () => {
    return !!localStorage.getItem('access');
  };

  const fetchOrders = async () => {
    if (!hasToken()) {
      setOrders([]);
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.get('/orders/orders/');
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData) => {
    try {
      const response = await axios.post('/orders/orders/', orderData);
      // Обновляем список заказов после создания нового
      await fetchOrders();
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating order:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.response?.data?.detail || 'Ошибка создания заказа' 
      };
    }
  };

  const cancelOrder = async (orderUuid) => {
    try {
      const response = await axios.patch(`/orders/orders/${orderUuid}/cancel/`);
      // Обновляем список заказов после отмены
      await fetchOrders();
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error cancelling order:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.response?.data?.detail || 'Ошибка отмены заказа' 
      };
    }
  };

  // Количество заказов
  const ordersCount = orders.length;

  const value = {
    orders,
    loading,
    ordersCount,
    fetchOrders,
    createOrder
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
}
