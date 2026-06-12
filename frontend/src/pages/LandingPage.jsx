import { ArrowRight, Clock, Flame, Percent } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/menu/ProductCard';
import { useCart } from '../context/CartContext';
import { useRestaurantConfig } from '../context/RestaurantConfigContext';
import { useMenu } from '../hooks/useMenu';
import { formatCurrency } from '../utils/formatters';

export function LandingPage() {
  const { config } = useRestaurantConfig();
  const { products, loading } = useMenu();
  const { addItem } = useCart();
  const featured = products.slice(0, 3);

  return (
    <div>
      <section className="bg-white">
        <div className="container-page grid gap-6 pb-8 pt-5 md:grid-cols-[1fr_0.9fr] md:items-center md:py-10">
          <div>
            <div className="flex items-center gap-2 text-sm font-black text-[color:var(--color-primary)]">
              <Clock size={16} />
              Pedidos rapidos desde tu celular
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-normal sm:text-5xl">{config.restaurantName}</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600 sm:text-base">
              Una experiencia moderna para ordenar comida rapida sin friccion: menu visual, carrito simple y seguimiento del pedido.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link to="/menu" className="btn-primary flex-1 sm:flex-none">
                Ordenar ahora
                <ArrowRight size={18} />
              </Link>
              <Link to="/register" className="btn-secondary flex-1 sm:flex-none">
                Crear cuenta
              </Link>
              <a className="btn-secondary flex-1 sm:flex-none" href={`https://wa.me/${config.whatsapp?.replace(/\D/g, '') || ''}`}>
                WhatsApp
              </a>
            </div>
          </div>
          <img
            src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd"
            alt="Comida destacada"
            className="h-56 w-full rounded-md object-cover shadow-soft sm:h-72 md:h-80"
          />
        </div>
      </section>

      <section className="container-page py-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="safe-panel flex items-center gap-3 p-4">
            <span className="grid h-11 w-11 place-items-center rounded-md bg-amber-100 text-amber-700">
              <Percent size={20} />
            </span>
            <div>
              <p className="font-black">Combo demo</p>
              <p className="text-sm text-stone-600">Hamburguesa + papas desde {formatCurrency(29900)}</p>
            </div>
          </div>
          <div className="safe-panel flex items-center gap-3 p-4">
            <span className="grid h-11 w-11 place-items-center rounded-md bg-red-100 text-red-700">
              <Flame size={20} />
            </span>
            <div>
              <p className="font-black">Mas vendidos</p>
              <p className="text-sm text-stone-600">Productos destacados para impulsar conversion.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page pb-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-black">Destacados</h2>
          <Link to="/menu" className="text-sm font-black text-[color:var(--color-primary)]">Ver menu</Link>
        </div>
        {loading ? <p className="text-sm text-stone-600">Cargando...</p> : null}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} onAdd={addItem} />
          ))}
        </div>
      </section>
    </div>
  );
}