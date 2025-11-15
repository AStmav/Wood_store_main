import { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/clients.js';
import { productService } from '../api/productService.js';

const CartContext = createContext();
const GUEST_CART_KEY = 'wood_project_guest_cart_v1';

function generateGuestItemId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `guest-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadGuestCartItems() {
  try {
    const stored = localStorage.getItem(GUEST_CART_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (error) {
    console.error('CartContext: Failed to load guest cart from storage', error);
    return [];
  }
}

function buildGuestCart(items) {
  const mappedItems = items.map((item) => {
    const price = item.product?.price || 0;
    return {
      uuid: item.uuid,
      product: item.product,
      quantity: item.quantity,
      total_price: price * item.quantity,
    };
  });

  const totalAmount = mappedItems.reduce((sum, item) => sum + (item.total_price || 0), 0);

  return {
    items: mappedItems,
    total_amount: totalAmount,
  };
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [guestCartItems, setGuestCartItems] = useState(() => loadGuestCartItems());

  const hasToken = () => !!localStorage.getItem('access');

  const saveGuestCartItems = (items) => {
    setGuestCartItems(items);
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('CartContext: Failed to persist guest cart', error);
    }
    if (!hasToken()) {
      setCart(buildGuestCart(items));
    }
  };

  const syncGuestCartToServer = async (items) => {
    if (!items.length) return;
    try {
      await Promise.all(
        items.map((item) =>
          axios.post('/orders/cart/', {
            product: item.product.uuid,
            quantity: item.quantity,
          })
        )
      );
      saveGuestCartItems([]);
    } catch (error) {
      console.error('CartContext: Failed to sync guest cart to server', error);
    }
  };

  const fetchCart = async () => {
    if (!hasToken()) {
      setCart(buildGuestCart(guestCartItems));
      return;
    }

    try {
      setLoading(true);
      if (guestCartItems.length) {
        await syncGuestCartToServer(guestCartItems);
      }
      const response = await axios.get('/orders/cart/');
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialized) {
      const timer = setTimeout(() => {
        fetchCart();
        setInitialized(true);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [initialized]);

  useEffect(() => {
    if (!hasToken()) {
      setCart(buildGuestCart(guestCartItems));
    }
  }, [guestCartItems]);

  const addToCart = async (productId, quantity = 1) => {
    if (!hasToken()) {
      try {
        const existing = guestCartItems.find((item) => item.product.uuid === productId);
        let productData = existing?.product;

        if (!productData) {
          productData = await productService.getProductById(productId);
        }

        const updatedItems = guestCartItems.map((item) => ({ ...item }));
        if (existing) {
          updatedItems.forEach((item) => {
            if (item.uuid === existing.uuid) {
              item.quantity += quantity;
            }
          });
        } else {
          updatedItems.push({
            uuid: generateGuestItemId(),
            product: productData,
            quantity,
          });
        }

        saveGuestCartItems(updatedItems);
        return { success: true, guest: true };
      } catch (error) {
        console.error('CartContext: Error adding to guest cart:', error);
        return {
          success: false,
          error: 'Не удалось добавить товар в корзину',
        };
      }
    }

    try {
      const response = await axios.post('/orders/cart/', {
        product: productId,
        quantity,
      });
      setCart(response.data);
      return { success: true };
    } catch (error) {
      console.error('CartContext: Error adding to cart:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.response?.data?.error || 'Ошибка добавления в корзину',
      };
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    if (!hasToken()) {
      const updatedItems = guestCartItems.map((item) =>
        item.uuid === itemId ? { ...item, quantity } : item
      );
      saveGuestCartItems(updatedItems);
      return { success: true };
    }

    try {
      if (!cart || !cart.uuid) {
        return {
          success: false,
          error: 'Корзина не найдена',
        };
      }

      const response = await axios.post(`/orders/cart/${cart.uuid}/update_item/`, {
        item_uuid: itemId,
        quantity,
      });
      setCart(response.data);
      return { success: true };
    } catch (error) {
      console.error('CartContext: Error updating cart item:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.response?.data?.error || 'Ошибка обновления корзины',
      };
    }
  };

  const removeFromCart = async (itemId) => {
    if (!hasToken()) {
      const updatedItems = guestCartItems.filter((item) => item.uuid !== itemId);
      saveGuestCartItems(updatedItems);
      return { success: true };
    }

    try {
      if (!cart || !cart.uuid) {
        return {
          success: false,
          error: 'Корзина не найдена',
        };
      }

      const response = await axios.post(`/orders/cart/${cart.uuid}/remove_item/`, {
        item_uuid: itemId,
      });
      setCart(response.data);
      return { success: true };
    } catch (error) {
      console.error('CartContext: Error removing from cart:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.response?.data?.error || 'Ошибка удаления из корзины',
      };
    }
  };

  const clearCart = async () => {
    if (!hasToken()) {
      saveGuestCartItems([]);
      return { success: true };
    }

    try {
      if (!cart || !cart.uuid) {
        return { success: true };
      }
      const response = await axios.post(`/orders/cart/${cart.uuid}/clear/`);
      setCart(response.data);
      return { success: true };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Ошибка очистки корзины',
      };
    }
  };

  const cartItemsCount = cart?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
  const isGuestCart = !hasToken();

  const value = {
    cart,
    loading,
    cartItemsCount,
    isGuestCart,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
} 