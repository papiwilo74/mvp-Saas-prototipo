import { BarChart3, CookingPot, LayoutDashboard, Package, ReceiptText, Settings, UsersRound } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useRestaurantConfig } from '../context/RestaurantConfigContext';
import { DemoBanner } from '../components/ui/DemoBanner';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Productos', icon: Package },
  { to: '/admin/orders', label: 'Pedidos', icon: ReceiptText },
  { to: '/admin/kitchen', label: 'Cocina', icon: CookingPot },
  { to: '/admin/analytics', label: 'Reportes', icon: BarChart3 },
  { to: '/admin/customers', label: 'Clientes', icon: UsersRound },
  { to: '/admin/settings', label: 'Config', icon: Settings }
];

export function AdminLayout() {
  const { config } = useRestaurantConfig();

  return (
    <div className="min-h-screen bg-stone-50">
      <DemoBanner />
      <header className="border-b border-stone-700" style={{ backgroundColor: 'var(--color-secondary, #18181b)' }}>
        <div className="h-1 w-full" style={{ backgroundColor: 'var(--color-primary)' }} />
        <div className="container-page flex min-h-16 flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm font-black tracking-tight text-white">{config.restaurantName}</Link>
            <span className="hidden sm:inline rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-stone-300">PANEL ADMIN</span>
          </div>
          <nav className="flex gap-2 overflow-x-auto">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-semibold ${
                    isActive ? 'bg-white text-stone-950' : 'text-stone-200 hover:bg-stone-800'
                  }`
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="container-page py-6 md:py-8">
        <Outlet />
      </main>
    </div>
  );
}
