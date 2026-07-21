import { Clock3, Home, ShoppingBag, Store } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useRestaurantConfig } from '../context/RestaurantConfigContext';
import { DemoBanner } from '../components/ui/DemoBanner';

const navItems = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/menu', label: 'Menu', icon: ShoppingBag }
];

export function AppLayout() {
  const { count } = useCart();
  const { config } = useRestaurantConfig();
  const activeDeliveryZoneCount = (config.deliveryZones || []).filter((zone) => zone.isActive !== false).length;

  return (
    <div className="app-shell">
      <header className="sticky top-0 z-30 border-b border-white/60 bg-[#f7f1e8]/90 backdrop-blur">
        <DemoBanner />
        <div className="container-page flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            {config.logoUrl ? <img src={config.logoUrl} alt="" className="h-11 w-11 rounded-2xl object-cover shadow-soft" /> : null}
            <div className="min-w-0">
              <span className="block truncate text-base font-black">{config.restaurantName}</span>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Pedidos directos y branding propio</span>
            </div>
          </Link>
          <div className="hidden items-center gap-2 md:flex">
            <div className="badge-chip">
              <Clock3 size={14} />
              {config.openingHours || 'Abierto hoy'}
            </div>
            <div className="badge-chip">
              <Store size={14} />
              {activeDeliveryZoneCount ? `${activeDeliveryZoneCount} zonas de entrega` : 'Retiro y domicilio'}
            </div>
          </div>
          <div className="flex items-center gap-2 self-end md:self-auto">
            <Link to="/login" className="btn-secondary min-h-10 px-3 text-sm">Admin</Link>
            <Link to="/cart" className="btn-primary relative min-h-10 px-3" aria-label="Carrito">
              <ShoppingBag size={18} />
              {count > 0 && (
                <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-stone-950 px-1 text-xs text-white">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white md:hidden">
        <div className="grid h-16 grid-cols-2">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 text-xs font-bold ${
                  isActive ? 'text-[color:var(--color-primary)]' : 'text-stone-500'
                }`
              }
            >
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}