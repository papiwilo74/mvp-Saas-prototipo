import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CartItem } from '../components/cart/CartItem';

const baseItem = {
  product: { id: 'p1', name: 'Hamburguesa', price: 15000, imageUrl: '/img.jpg' },
  quantity: 2
};

describe('CartItem', () => {
  it('renders product name and price', () => {
    render(<CartItem item={baseItem} onQuantityChange={() => {}} />);
    expect(screen.getByText('Hamburguesa')).toBeInTheDocument();
    expect(screen.getByText(/\$ 15\.000/)).toBeInTheDocument();
  });

  it('shows quantity', () => {
    render(<CartItem item={baseItem} onQuantityChange={() => {}} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('calls onQuantityChange on minus button', () => {
    const onChange = vi.fn();
    render(<CartItem item={baseItem} onQuantityChange={onChange} />);
    fireEvent.click(screen.getByText('2').previousElementSibling);
    expect(onChange).toHaveBeenCalledWith('p1', 1);
  });

  it('calls onQuantityChange on plus button', () => {
    const onChange = vi.fn();
    render(<CartItem item={baseItem} onQuantityChange={onChange} />);
    fireEvent.click(screen.getByText('2').nextElementSibling);
    expect(onChange).toHaveBeenCalledWith('p1', 3);
  });

  it('shows variant labels when present', () => {
    const item = { ...baseItem, product: { ...baseItem.product, _variantLabels: ['Extra queso', 'Sin cebolla'] } };
    render(<CartItem item={item} onQuantityChange={() => {}} />);
    expect(screen.getByText('Extra queso · Sin cebolla')).toBeInTheDocument();
  });
});
