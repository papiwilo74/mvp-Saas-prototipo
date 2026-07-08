import { Minus, Plus, ShoppingBag, Sparkles, Tag } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CartSkeleton, ProductSkeleton } from '../components/ui/Skeleton';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useMenu } from '../hooks/useMenu';
import { formatCurrency } from '../utils/formatters';

export function ProductDetailPage() {
  const { id } = useParams();
  const { products, loading } = useMenu();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState({});
  const product = useMemo(() => products.find((item) => item.id === id), [products, id]);
  const relatedProducts = useMemo(
    () => products.filter((item) => item.categoryId === product?.categoryId && item.id !== product?.id).slice(0, 3),
    [products, product]
  );

  const variants = product?.variants || [];
  const variantPriceAdjustment = Object.entries(selectedVariants).reduce((sum, [variantIndex, optionIndex]) => {
    const variant = variants[Number(variantIndex)];
    const option = variant?.options?.[Number(optionIndex)];
    return sum + (option?.priceAdjustment || 0);
  }, 0);
  const adjustedPrice = (Number(product?.price || 0)) + variantPriceAdjustment;

  if (loading) return (
    <div className="container-page py-10">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <ProductSkeleton />
        <div className="glass-panel p-6 space-y-4">
          <div className="animate-pulse rounded-2xl bg-stone-200 h-6 w-32" />
          <div className="animate-pulse rounded-2xl bg-stone-200 h-10 w-3/4" />
          <div className="animate-pulse rounded-2xl bg-stone-200 h-20 w-full" />
          <div className="animate-pulse rounded-2xl bg-stone-200 h-10 w-28" />
        </div>
      </div>
    </div>
  );

  if (!product) return <div className="container-page py-10 text-sm text-stone-600">Producto no encontrado.</div>;

  const maxStock = product.trackStock && typeof product.stock === 'number' ? product.stock : Infinity;

  const addToCart = () => {
    if (product.trackStock && typeof product.stock === 'number' && product.stock <= 0) {
      toast(`${product.name} esta agotado`, 'error');
      return;
    }
    const missingRequired = variants
      .filter((v) => v.required)
      .some((_, i) => selectedVariants[i] === undefined);
    if (missingRequired) {
      toast('Selecciona todas las opciones requeridas', 'warning');
      return;
    }
    const variantLabels = Object.entries(selectedVariants).map(([vi, oi]) => {
      const v = variants[Number(vi)];
      const o = v?.options?.[Number(oi)];
      return `${v?.name}: ${o?.name}`;
    });
    Array.from({ length: quantity }).forEach(() =>
      addItem({ ...product, price: adjustedPrice, _variantLabels: variantLabels })
    );
    toast(`${product.name} agregado al carrito`, 'success');
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
          <p className="mt-6 text-4xl font-black">
            {variantPriceAdjustment !== 0 && (
              <span className="mr-2 text-base text-stone-400 line-through">{formatCurrency(product.price)}</span>
            )}
            {formatCurrency(adjustedPrice)}
          </p>

          {product.trackStock && product.stock <= 0 && (
            <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">Producto agotado temporalmente</p>
          )}

          {variants.map((variant, vi) => (
            <div key={vi} className="mt-4">
              <label className="label">
                {variant.name}
                {variant.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {variant.options?.map((option, oi) => {
                  const isSelected = selectedVariants[vi] === oi;
                  return (
                    <button
                      key={oi}
                      type="button"
                      onClick={() => setSelectedVariants((prev) => ({ ...prev, [vi]: oi }))}
                      className={`min-h-10 rounded-full border px-4 text-sm font-bold transition ${
                        isSelected
                          ? 'border-stone-950 bg-stone-950 text-white'
                          : 'border-stone-300 bg-white text-stone-800 hover:border-stone-400'
                      }`}
                    >
                      {option.name}
                      {option.priceAdjustment > 0 && ` +${formatCurrency(option.priceAdjustment)}`}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="safe-panel p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Pedido rapido</p>
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
              <button
                type="button"
                className="btn-secondary h-10 min-h-10 w-10 px-0"
                onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                disabled={quantity >= maxStock}
              >
                <Plus size={16} />
              </button>
            </div>
            <button
              type="button"
              className="btn-primary flex-1"
              onClick={addToCart}
              disabled={product.trackStock && product.stock <= 0}
            >
              <ShoppingBag size={18} />
              {product.trackStock && product.stock <= 0 ? 'Agotado' : 'Agregar al carrito'}
            </button>
          </div>

          <Link to="/cart" className="btn-secondary mt-4 w-full">Ir al carrito</Link>
        </div>
      </div>

      {relatedProducts.length ? (
        <section className="pt-8">
          <div className="mb-4">
            <h2 className="text-2xl font-black tracking-tight">Tambien te puede gustar</h2>
            <p className="mt-1 text-sm text-stone-600">Mas productos de la misma categoria para reforzar la venta cruzada.</p>
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
