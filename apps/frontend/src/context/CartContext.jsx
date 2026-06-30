import { createContext, useContext, useState, useEffect } from 'react';
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
    return Array.isArray(parsed) ? parsed : [];
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
  const [guestCartItems, setGuestCartItems] = useState(() => loadGuestCartItems());
  const [cart, setCart] = useState(() => buildGuestCart(loadGuestCartItems()));
  const [loading, setLoading] = useState(false);

  const saveGuestCartItems = (items) => {
    setGuestCartItems(items);
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('CartContext: Failed to persist guest cart', error);
    }
    setCart(buildGuestCart(items));
  };

  useEffect(() => {
    setCart(buildGuestCart(guestCartItems));
  }, [guestCartItems]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      setLoading(true);
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
      return { success: true };
    } catch (error) {
      console.error('CartContext: Error adding to cart:', error);
      return {
        success: false,
        error: 'Не удалось добавить товар в корзину',
      };
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    const updatedItems = guestCartItems.map((item) =>
      item.uuid === itemId ? { ...item, quantity } : item,
    );
    saveGuestCartItems(updatedItems);
    return { success: true };
  };

  const removeFromCart = async (itemId) => {
    const updatedItems = guestCartItems.filter((item) => item.uuid !== itemId);
    saveGuestCartItems(updatedItems);
    return { success: true };
  };

  const clearCart = async () => {
    saveGuestCartItems([]);
    return { success: true };
  };

  const cartItemsCount = cart?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

  const value = {
    cart,
    loading,
    cartItemsCount,
    isGuestCart: true,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
