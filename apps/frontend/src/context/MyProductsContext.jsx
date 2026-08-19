import { createContext, useContext, useState, useEffect } from 'react';
import { productService } from '../api/productService.js';
import { isProductOrderable } from '../utils/productAvailability.js';

const MyProductsContext = createContext();
const STORAGE_KEY = 'wood_project_my_products_v1';
const LEGACY_CART_KEY = 'wood_project_guest_cart_v1';
const LEGACY_FAVORITES_KEY = 'guest_favorites';

function generateItemId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `item-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadStoredItems() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : null;
  } catch (error) {
    console.error('MyProductsContext: failed to load storage', error);
    return null;
  }
}

function loadLegacyCartItems() {
  try {
    const stored = localStorage.getItem(LEGACY_CART_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadLegacyFavoriteIds() {
  try {
    const stored = localStorage.getItem(LEGACY_FAVORITES_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistItems(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('MyProductsContext: failed to persist storage', error);
  }
}

export function useMyProducts() {
  const context = useContext(MyProductsContext);
  if (!context) {
    throw new Error('useMyProducts must be used within a MyProductsProvider');
  }
  return context;
}

export function MyProductsProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      const existing = loadStoredItems();
      if (existing) {
        if (!cancelled) {
          setItems(existing);
          setLoading(false);
        }
        return;
      }

      const merged = [];
      const seen = new Set();

      for (const legacyItem of loadLegacyCartItems()) {
        const productUuid = legacyItem?.product?.uuid;
        if (!productUuid || seen.has(productUuid)) continue;
        seen.add(productUuid);
        merged.push({
          uuid: generateItemId(),
          product: legacyItem.product,
        });
      }

      const legacyFavoriteIds = loadLegacyFavoriteIds();
      if (legacyFavoriteIds.length) {
        const products = await Promise.all(
          legacyFavoriteIds.map((productUuid) =>
            productService.getProductById(productUuid).catch(() => null),
          ),
        );

        for (const product of products) {
          if (!product?.uuid || seen.has(product.uuid)) continue;
          seen.add(product.uuid);
          merged.push({
            uuid: generateItemId(),
            product,
          });
        }
      }

      if (!cancelled) {
        setItems(merged);
        persistItems(merged);
        setLoading(false);
      }
    };

    initialize();

    return () => {
      cancelled = true;
    };
  }, []);

  const saveItems = (nextItems) => {
    setItems(nextItems);
    persistItems(nextItems);
  };

  const isInMyProducts = (productUuid) =>
    items.some((item) => item.product?.uuid === productUuid);

  const addProduct = async (productId) => {
    if (isInMyProducts(productId)) {
      return { success: true, alreadyAdded: true };
    }

    try {
      setLoading(true);
      const productData = await productService.getProductById(productId);
      if (!isProductOrderable(productData)) {
        return {
          success: false,
          error: 'Товар в пути — добавление недоступно',
        };
      }
      const nextItems = [
        ...items,
        {
          uuid: generateItemId(),
          product: productData,
        },
      ];
      saveItems(nextItems);
      return { success: true, alreadyAdded: false };
    } catch (error) {
      console.error('MyProductsContext: failed to add product', error);
      return {
        success: false,
        error: 'Не удалось добавить товар',
      };
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = async (itemId) => {
    const nextItems = items.filter((item) => item.uuid !== itemId);
    saveItems(nextItems);
    return { success: true };
  };

  const clearProducts = async () => {
    saveItems([]);
    return { success: true };
  };

  const toggleProduct = async (productId) => {
    if (isInMyProducts(productId)) {
      const item = items.find((entry) => entry.product?.uuid === productId);
      if (!item) return { success: false };
      await removeProduct(item.uuid);
      return { success: true, isInList: false };
    }

    const result = await addProduct(productId);
    return {
      ...result,
      isInList: result.success,
    };
  };

  const itemsCount = items.length;

  const value = {
    items,
    loading,
    itemsCount,
    isInMyProducts,
    addProduct,
    removeProduct,
    clearProducts,
    toggleProduct,
  };

  return <MyProductsContext.Provider value={value}>{children}</MyProductsContext.Provider>;
}
