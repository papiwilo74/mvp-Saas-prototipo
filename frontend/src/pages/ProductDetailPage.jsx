import { Minus, Plus, ShoppingBag, Sparkles, Tag } from 'lucide-react';
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
  const relatedProducts = useMemo(
    () => products.filter((item) => item.categoryId === product?.categoryId && item.id !== product?.id).slice(0, 3),
    [products, product]
  );

  if (loading) return <div className="container-page py-10 text-sm text-stone-600">Cargando producto...</div>;
  if (!product) return <div className="container-page py-10 text-sm text-stone-600">Producto no encontrado.</div>;

  const addToCart = () => {
    Array.from({ length: quantity }).forEach(() => addItem(product));
  };

  return (
    <div className="container-page pb-10 pt-5">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div className="relative overflow-hidden rounded-[32px] shadow-soft">
          <img src={product.imageUrl} alt={product.name} className="h-80 w-full object-cover md:h-[520px]" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent p-5">
            <div className="flex flex-wrap gap-2">
              <span className="badge-chip border-0 bg-white text-stone-800 shadow-none">
                <Tag size={14} />
                {product.category?.name}
              </span>
              {product.isCombo ? <span className="badge-chip border-0 bg-white text-purple-700 shadow-none">Combo estrella</span> : null}
              {product.trackStock ? <span className="badge-chip border-0 bg-white text-stone-800 shadow-none">Stock {product.stock ?? 0}</span> : null}
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 sm:p-7">
          <span className="badge-chip text-[color:var(--color-primary)]">
            <Sparkles size={14} />
            Recomendado en la demo
          </span>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-stone-950">{product.name}</h1>
          <p className="mt-4 text-base leading-7 text-stone-600">{product.description}</p>
          <p className="mt-6 text-4xl font-black">{formatCurrency(product.price)}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="safe-panel p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Pedido rápido</p>
              <p className="mt-2 text-sm text-stone-600">Agrega este producto al carrito y termina el checkout en pocos pasos.</p>
            </div>
            <div className="safe-panel p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Ideal para vender</p>
              <p className="mt-2 text-sm text-stone-600">Pantalla pensada para que el restaurante perciba una experiencia premium.</p>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-stone-300 bg-white p-1.5 shadow-sm">
              <button type="button" className="btn-secondary h-10 min-h-10 w-10 px-0" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                <Minus size={16} />
              </button>
              <span className="grid h-10 w-10 place-items-center font-black">{quantity}</span>
              <button type="button" className="btn-secondary h-10 min-h-10 w-10 px-0" onClick={() => setQuantity(quantity + 1)}>
                <Plus size={16} />
              </button>
            </div>
            <button type="button" className="btn-primary flex-1" onClick={addToCart}>
              <ShoppingBag size={18} />
              Agregar al carrito
            </button>
          </div>

          <Link to="/cart" className="btn-secondary mt-4 w-full">Ir al carrito</Link>
        </div>
      </div>

      {relatedProducts.length ? (
        <section className="pt-8">
          <div className="mb-4">
            <h2 className="text-2xl font-black tracking-tight">También te puede gustar</h2>
            <p className="mt-1 text-sm text-stone-600">Más productos de la misma categoría para reforzar la venta cruzada.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {relatedProducts.map((item) => (
              <Link key={item.id} to={`/products/${item.id}`} className="safe-panel overflow-hidden transition hover:-translate-y-1">
                <img src={item.imageUrl} alt={item.name} className="h-40 w-full object-cover" />
                <div className="p-4">
                  <p className="text-lg font-black">{item.name}</p>
                  <p className="mt-1 text-sm text-stone-600">{item.description}</p>
                  <p className="mt-3 font-black">{formatCurrency(item.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
