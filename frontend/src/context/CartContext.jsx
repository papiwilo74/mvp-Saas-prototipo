import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'ff_cart';

const loadCart = () => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [stockWarning, setStockWarning] = useState('');

  useEffect(() => {
    const stored = loadCart();
    setItems(stored);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isHydrated]);

  const addItem = (product) => {
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
  };

  const updateQuantity = (productId, quantity) => {
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
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  const value = useMemo(
    () => ({ items, total, count, addItem, updateQuantity, clearCart, stockWarning, isHydrated }),
    [items, total, count, stockWarning, isHydrated]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
