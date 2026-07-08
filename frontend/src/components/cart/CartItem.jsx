import { Minus, Plus } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export function CartItem({ item, onQuantityChange }) {
  const { product, quantity } = item;
  const variantLabels = product._variantLabels || [];

  return (
    <div className="flex items-center gap-4 border-b border-stone-200/70 py-4 last:border-b-0">
      <img src={product.imageUrl} alt={product.name} className="h-20 w-20 rounded-2xl object-cover shadow-sm" />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-black tracking-tight">{product.name}</h3>
        {variantLabels.length > 0 && (
          <p className="mt-0.5 text-xs text-stone-500">{variantLabels.join(' · ')}</p>
        )}
        <p className="mt-1 text-sm text-stone-600">{formatCurrency(product.price)}</p>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" className="btn-secondary h-10 min-h-10 w-10 px-0" onClick={() => onQuantityChange(product.id, quantity - 1)}>
          <Minus size={16} />
        </button>
        <span className="grid h-10 w-8 place-items-center text-sm font-black">{quantity}</span>
        <button type="button" className="btn-secondary h-10 min-h-10 w-10 px-0" onClick={() => onQuantityChange(product.id, quantity + 1)}>
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
