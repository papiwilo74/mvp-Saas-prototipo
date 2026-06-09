import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useMenu } from '../hooks/useMenu';
import { formatCurrency } from '../utils/formatters';

export function ProductDetailPage() {
  const { id } = useParams();
  const { products, loading } = useMenu();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const product = useMemo(() => products.find((item) => item.id === id), [products, id]);

  if (loading) return <div className="container-page py-10 text-sm text-stone-600">Cargando producto...</div>;
  if (!product) return <div className="container-page py-10 text-sm text-stone-600">Producto no encontrado.</div>;

  const addToCart = () => {
    Array.from({ length: quantity }).forEach(() => addItem(product));
  };

  return (
    <div className="container-page pb-8 pt-4">
      <img src={product.imageUrl} alt={product.name} className="h-72 w-full rounded-md object-cover shadow-soft md:h-96" />
      <div className="mt-5">
        <p className="text-sm font-black text-[color:var(--color-primary)]">{product.category?.name}</p>
        <h1 className="mt-1 text-3xl font-black">{product.name}</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">{product.description}</p>
        <p className="mt-5 text-3xl font-black">{formatCurrency(product.price)}</p>
      </div>
      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="inline-flex items-center gap-3 rounded-md border border-stone-300 bg-white p-1">
          <button type="button" className="btn-secondary h-10 min-h-10 w-10 px-0" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
            <Minus size={16} />
          </button>
          <span className="grid h-10 w-8 place-items-center font-black">{quantity}</span>
          <button type="button" className="btn-secondary h-10 min-h-10 w-10 px-0" onClick={() => setQuantity(quantity + 1)}>
            <Plus size={16} />
          </button>
        </div>
        <button type="button" className="btn-primary flex-1" onClick={addToCart}>
          <ShoppingBag size={18} />
          Agregar
        </button>
      </div>
      <Link to="/cart" className="btn-secondary mt-4 w-full">Ir al carrito</Link>
    </div>
  );
}
