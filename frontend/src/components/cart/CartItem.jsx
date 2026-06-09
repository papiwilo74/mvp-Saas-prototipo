import { Minus, Plus } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export function CartItem({ item, onQuantityChange }) {
  const { product, quantity } = item;

  return (
    <div className="flex items-center gap-4 border-b border-stone-200 py-4">
      <img src={product.imageUrl} alt={product.name} className="h-16 w-16 rounded-md object-cover" />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-bold">{product.name}</h3>
        <p className="text-sm text-stone-600">{formatCurrency(product.price)}</p>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" className="btn-secondary h-10 min-h-10 w-10 px-0" onClick={() => onQuantityChange(product.id, quantity - 1)}>
          <Minus size={16} />
        </button>
        <span className="grid h-10 w-8 place-items-center text-sm font-bold">{quantity}</span>
        <button type="button" className="btn-secondary h-10 min-h-10 w-10 px-0" onClick={() => onQuantityChange(product.id, quantity + 1)}>
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

