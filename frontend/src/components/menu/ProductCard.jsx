import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';

export function ProductCard({ product, onAdd }) {
  return (
    <article className="group overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-soft transition hover:-translate-y-1">
      <Link to={`/products/${product.id}`} className="relative block aspect-[4/3] bg-stone-200">
        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : null}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/60 via-black/10 to-transparent p-4">
          <div className="flex flex-wrap gap-2">
            {product.isCombo ? <span className="badge-chip border-0 bg-white text-purple-700 shadow-none">Combo</span> : null}
            {product.trackStock ? <span className="badge-chip border-0 bg-white text-stone-700 shadow-none">Stock {product.stock ?? 0}</span> : null}
          </div>
        </div>
      </Link>
      <div className="space-y-3 p-5">
        <div>
          <Link to={`/products/${product.id}`} className="text-lg font-black tracking-tight">
            {product.name}
          </Link>
          <p className="mt-1 min-h-10 text-sm leading-6 text-stone-600">{product.description}</p>
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
