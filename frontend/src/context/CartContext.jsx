import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { env } from '../config/env';
import { useRestaurantConfig } from './RestaurantConfigContext';

const CartContext = createContext(null);

const getCartStorageKey = (slug) => `ff_cart:${slug || env.restaurantSlug || 'demo-burger'}`;

const loadCart = (slug) => {
  try {
    const stored = localStorage.getItem(getCartStorageKey(slug));
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

function InnerCartProvider({ currentSlug, children }) {
  const [items, setItems] = useState(() => loadCart(currentSlug));
  const [stockWarning, setStockWarning] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(getCartStorageKey(currentSlug), JSON.stringify(items));
    } catch {
      // ignore storage errors
    }
  }, [items, currentSlug]);

  const addItem = useCallback((product) => {
    setStockWarning('');
    setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      const currentQty = existing ? existing.quantity : 0;
      const newQty = currentQty + 1;

      if (product.trackStock && typeof product.stock === 'number' && newQty > product.stock) {
        setStockWarning(`Stock maximo alcanzado para ${product.name} (${product.stock} disponibles)`);
        return current;
      }

      if (existing) {
        return current.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      }

      return [...current, { product, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    setStockWarning('');
    setItems((current) =>
      current
        .map((item) => {
          if (item.product.id !== productId) return item;
          if (item.product.trackStock && typeof item.product.stock === 'number' && quantity > item.product.stock) {
            setStockWarning(`Stock maximo alcanzado para ${item.product.name} (${item.product.stock} disponibles)`);
            return item;
          }
          return { ...item, quantity };
        })
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  const value = useMemo(
    () => ({ items, total, count, addItem, updateQuantity, clearCart, stockWarning }),
    [items, total, count, addItem, updateQuantity, clearCart, stockWarning]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function CartProvider({ children }) {
  const { activeSlug } = useRestaurantConfig() || {};
  const currentSlug = activeSlug || env.restaurantSlug || 'demo-burger';

  return (
    <InnerCartProvider key={currentSlug} currentSlug={currentSlug}>
      {children}
    </InnerCartProvider>
  );
}

export const useCart = () => useContext(CartContext);
