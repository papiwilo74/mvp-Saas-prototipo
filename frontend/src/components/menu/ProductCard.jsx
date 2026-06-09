import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';

export function ProductCard({ product, onAdd }) {
  return (
    <article className="overflow-hidden rounded-md border border-stone-200 bg-white shadow-sm">
      <Link to={`/products/${product.id}`} className="block aspect-[4/3] bg-stone-200">
        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" /> : null}
      </Link>
      <div className="space-y-3 p-4">
        <div>
          <Link to={`/products/${product.id}`} className="text-base font-black">
            {product.name}
          </Link>
          <p className="mt-1 min-h-10 text-sm text-stone-600">{product.description}</p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-lg font-black">{formatCurrency(product.price)}</p>
          <button type="button" onClick={() => onAdd(product)} className="btn-primary px-3" aria-label="Agregar">
            <Plus size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}
