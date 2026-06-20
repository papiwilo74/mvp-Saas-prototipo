import { Home, ShoppingBag } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useRestaurantConfig } from '../context/RestaurantConfigContext';

const navItems = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/menu', label: 'Menu', icon: ShoppingBag }
];

export function AppLayout() {
  const { count } = useCart();
  const { config } = useRestaurantConfig();

  return (
    <div className="app-shell">
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between gap-3">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            {config.logoUrl ? <img src={config.logoUrl} alt="" className="h-9 w-9 rounded-md object-cover" /> : null}
            <span className="truncate text-base font-black">{config.restaurantName}</span>
          </Link>
          <Link to="/cart" className="btn-primary relative min-h-10 px-3" aria-label="Carrito">
            <ShoppingBag size={18} />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-stone-950 px-1 text-xs text-white">
                {count}
              </span>
            )}
          </Link>
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