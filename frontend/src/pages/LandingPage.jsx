import { ArrowRight, Clock, Flame, MapPinned, Percent, ShieldCheck, Star, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/menu/ProductCard';
import { ProductSkeleton } from '../components/ui/Skeleton';
import { useCart } from '../context/CartContext';
import { useRestaurantConfig } from '../context/RestaurantConfigContext';
import { useMenu } from '../hooks/useMenu';
import { formatCurrency } from '../utils/formatters';

export function LandingPage() {
  const { config } = useRestaurantConfig();
  const { products, loading } = useMenu();
  const { addItem } = useCart();
  const featured = products.slice(0, 3);
  const combos = products.filter((product) => product.isCombo).slice(0, 2);
  const topZone = (config.deliveryZones || []).find((zone) => zone.isActive !== false);
  const whatsappUrl = `https://wa.me/${config.whatsapp?.replace(/\D/g, '') || ''}`;
  const heroImage = config.heroImageUrl || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd';

  return (
    <div className="pb-8">
      <section className="container-page pt-5 md:pt-8">
        <div className="glass-panel relative overflow-hidden px-6 py-8 sm:px-8 md:px-10 md:py-12">
          <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[color:var(--color-primary)]/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-stone-950/10 blur-3xl" />
          <div className="relative grid gap-8 md:grid-cols-[1fr_0.95fr] md:items-center">
            <div>
              <div className="badge-chip text-[color:var(--color-primary)]">
              <Clock size={16} />
                Pedidos directos sin depender solo de apps externas
              </div>
              <h1 className="mt-4 max-w-2xl text-4xl font-black tracking-tight text-stone-950 sm:text-6xl">
                {config.restaurantName}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
                Una vitrina digital premium para vender combos, impulsar recompra y recibir pedidos directamente en tu panel con una experiencia rapida, visual y confiable.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="badge-chip">
                  <Star size={14} />
                  Marca propia
                </span>
                <span className="badge-chip">
                  <WalletCards size={14} />
                  Cupones y combos
                </span>
                <span className="badge-chip">
                  <ShieldCheck size={14} />
                  Checkout simple
                </span>
              </div>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link to="/menu" className="btn-primary flex-1 sm:flex-none">
                  Ver menu y ordenar
                  <ArrowRight size={18} />
                </Link>
                <a className="btn-secondary flex-1 sm:flex-none" href={whatsappUrl}>
                  Hablar por WhatsApp
                </a>
              </div>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <div className="safe-panel p-4">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-stone-500">Entrega</p>
                  <p className="mt-2 text-lg font-black">{topZone ? `${topZone.estimatedMinutes || 30} min` : '25-35 min'}</p>
                  <p className="mt-1 text-sm text-stone-600">{topZone ? topZone.name : 'Cobertura principal'}</p>
                </div>
                <div className="safe-panel p-4">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-stone-500">Combo estrella</p>
                  <p className="mt-2 text-lg font-black">{combos[0]?.name || 'Burger + papas'}</p>
                  <p className="mt-1 text-sm text-stone-600">{formatCurrency(combos[0]?.price || 29900)}</p>
                </div>
                <div className="safe-panel p-4">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-stone-500">Horario</p>
                  <p className="mt-2 text-lg font-black">{config.acceptsScheduledOrders ? 'Pedido programable' : 'Atencion directa'}</p>
                  <p className="mt-1 text-sm text-stone-600">{config.openingHours}</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-5 left-4 z-10 max-w-[220px] rounded-[28px] bg-white p-4 shadow-soft">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Promocion activa</p>
                <p className="mt-2 text-lg font-black">Cupon {config.coupons?.[0]?.code || 'BIENVENIDA10'}</p>
                <p className="mt-1 text-sm text-stone-600">{config.coupons?.[0]?.description || '10% de descuento para impulsar la primera compra'}</p>
              </div>
              <img
                src={heroImage}
                alt="Comida destacada"
                className="h-[420px] w-full rounded-[32px] object-cover shadow-soft"
              />
              <div className="absolute -bottom-5 right-4 z-10 rounded-[28px] bg-stone-950 px-5 py-4 text-white shadow-soft">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-300">Zona destacada</p>
                <div className="mt-2 flex items-center gap-2">
                  <MapPinned size={18} />
                  <span className="font-black">{topZone?.name || 'Centro'}</span>
                </div>
                <p className="mt-1 text-sm text-stone-300">Domicilio desde {formatCurrency(topZone?.fee || config.deliveryFee || 3000)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-8">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="safe-panel flex items-center gap-4 p-5">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-amber-700">
              <Percent size={20} />
            </span>
            <div>
              <p className="font-black">Promos que convierten</p>
              <p className="text-sm text-stone-600">Cupones, combos y campanas para elevar el ticket promedio.</p>
            </div>
          </div>
          <div className="safe-panel flex items-center gap-4 p-5">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-red-100 text-red-700">
              <Flame size={20} />
            </span>
            <div>
              <p className="font-black">Visual premium</p>
              <p className="text-sm text-stone-600">Un catalogo que se siente mas marca propia y menos formulario.</p>
            </div>
          </div>
          <div className="safe-panel flex items-center gap-4 p-5">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Clock size={20} />
            </span>
            <div>
              <p className="font-black">Operacion mas ordenada</p>
              <p className="text-sm text-stone-600">Pedidos programados, zonas de entrega y control basico de stock.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page pb-4">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h2 className="section-title">Destacados que venden solos</h2>
            <p className="section-copy">Una seleccion pensada para impresionar al restaurante cuando vea la demo.</p>
          </div>
          <Link to="/menu" className="text-sm font-black text-[color:var(--color-primary)]">Ver menu</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <ProductSkeleton key={i} />)
            : featured.map((product) => (
                <ProductCard key={product.id} product={product} onAdd={addItem} />
              ))}
        </div>
      </section>

      <section className="container-page pt-6">
        <div className="glass-panel px-6 py-8 sm:px-8">
          <div className="grid gap-6 md:grid-cols-[0.8fr_1fr] md:items-center">
            <div>
              <h2 className="section-title">La demo ya comunica valor de negocio</h2>
              <p className="section-copy">
                Presenta catalogo, promociones, tiempos de entrega y pedido directo en una sola experiencia. Esto te ayuda a vender implementacion a restaurantes desde la primera reunion.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="safe-panel p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Ideal para mostrar</p>
                <p className="mt-2 text-lg font-black">Marca, menu y promos</p>
                <p className="mt-1 text-sm text-stone-600">Se ve como un negocio listo para recibir pedidos.</p>
              </div>
              <div className="safe-panel p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Ideal para vender</p>
                <p className="mt-2 text-lg font-black">Canal directo propio</p>
                <p className="mt-1 text-sm text-stone-600">Menos dependencia de plataformas externas y mejor relacion con clientes.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
