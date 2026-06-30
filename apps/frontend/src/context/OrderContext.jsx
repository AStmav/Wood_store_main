import { createContext, useContext, useState } from 'react';
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
  const [loading, setLoading] = useState(false);

  const createOrder = async (orderData) => {
    try {
      setLoading(true);
      const response = await axios.post('/orders/orders/', orderData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating order:', error);
      return {
        success: false,
        error: error.response?.data || error.response?.data?.detail || 'Ошибка создания заказа',
      };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    loading,
    createOrder,
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
}
