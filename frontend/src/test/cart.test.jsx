import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '../context/CartContext';

const product = (id, overrides = {}) => ({
  id,
  name: `Producto ${id}`,
  price: 15000,
  description: 'Test',
  stock: 10,
  trackStock: true,
  ...overrides
});

describe('CartContext', () => {
  beforeEach(() => localStorage.clear());

  const renderCartHook = () => renderHook(() => useCart(), { wrapper: CartProvider });

  it('agrega productos al carrito', () => {
    const { result } = renderCartHook();
    act(() => result.current.addItem(product('1')));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.count).toBe(1);
  });

  it('incrementa cantidad al agregar mismo producto', () => {
    const { result } = renderCartHook();
    act(() => result.current.addItem(product('1')));
    act(() => result.current.addItem(product('1')));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.count).toBe(2);
  });

  it('respeta el stock maximo', () => {
    const { result } = renderCartHook();
    const p = product('1', { stock: 3, trackStock: true });
    act(() => result.current.addItem(p));
    act(() => result.current.addItem(p));
    act(() => result.current.addItem(p));
    act(() => result.current.addItem(p)); // 4th should be blocked
    expect(result.current.count).toBe(3);
  });

  it('calcula el total correctamente', () => {
    const { result } = renderCartHook();
    act(() => result.current.addItem(product('1', { price: 10000 })));
    act(() => result.current.addItem(product('2', { price: 5000 })));
    expect(result.current.total).toBe(15000);
  });

  it('actualiza cantidades', () => {
    const { result } = renderCartHook();
    act(() => result.current.addItem(product('1')));
    act(() => result.current.updateQuantity('1', 5));
    expect(result.current.count).toBe(5);
  });

  it('elimina items al poner cantidad 0', () => {
    const { result } = renderCartHook();
    act(() => result.current.addItem(product('1')));
    act(() => result.current.updateQuantity('1', 0));
    expect(result.current.items).toHaveLength(0);
  });

  it('limpia el carrito', () => {
    const { result } = renderCartHook();
    act(() => result.current.addItem(product('1')));
    act(() => result.current.addItem(product('2')));
    act(() => result.current.clearCart());
    expect(result.current.items).toHaveLength(0);
  });

  it('persiste el carrito en localStorage', () => {
    const { result } = renderCartHook();
    act(() => result.current.addItem(product('1')));
    const stored = JSON.parse(localStorage.getItem('ff_cart'));
    expect(stored).toHaveLength(1);
  });
});
