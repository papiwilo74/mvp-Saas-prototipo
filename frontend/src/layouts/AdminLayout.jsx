import { BarChart3, CookingPot, ExternalLink, LayoutDashboard, LogOut, Package, ReceiptText, Settings, UserCog, UsersRound } from 'lucide-react';
import { SocketNotifier } from '../components/ui/SocketNotifier';
import { OnboardingWizard } from '../components/ui/OnboardingWizard';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useRestaurantConfig } from '../context/RestaurantConfigContext';
import { useAuth } from '../context/AuthContext';
import { DemoBanner } from '../components/ui/DemoBanner';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Productos', icon: Package },
  { to: '/admin/orders', label: 'Pedidos', icon: ReceiptText },
  { to: '/admin/kitchen', label: 'Cocina', icon: CookingPot },
  { to: '/admin/analytics', label: 'Reportes', icon: BarChart3 },
  { to: '/admin/staff', label: 'Empleados', icon: UserCog },
  { to: '/admin/customers', label: 'Clientes', icon: UsersRound },
  { to: '/admin/settings', label: 'Config', icon: Settings }
];

export function AdminLayout() {
  const { config, activeSlug: configSlug } = useRestaurantConfig();
  const { user, logout } = useAuth();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const activeSlug = params.get('restaurant') || user?.restaurantSlug || configSlug || '';
  const query = activeSlug ? `?restaurant=${activeSlug}` : location.search;
  const visibleLinks = config.showKitchenPanel === false ? links.filter((link) => link.to !== '/admin/kitchen') : links;
  const storeUrl = activeSlug ? `/menu?restaurant=${activeSlug}` : '/menu';

  return (
    <div className="min-h-screen bg-stone-50">
      <DemoBanner />
      <SocketNotifier />
      <header className="border-b border-stone-700" style={{ backgroundColor: 'var(--color-secondary, #18181b)' }}>
        <div className="h-1 w-full" style={{ backgroundColor: 'var(--color-primary)' }} />
        <div className="container-page flex min-h-16 flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3">
            <Link to={`/admin${query}`} className="text-sm font-black tracking-tight text-white hover:text-orange-400 transition">
              {config.restaurantName || user?.restaurant?.name || 'Mi Negocio'}
            </Link>
            <span className="hidden sm:inline rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold text-stone-300">ADMIN</span>
            {activeSlug && (
              <a
                href={storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-orange-500"
                title="Abrir tu tienda online como la ven tus clientes"
              >
                <ExternalLink size={13} />
                <span className="hidden md:inline">Ver mi tienda online</span>
                <span className="md:hidden">Ver tienda</span>
              </a>
            )}
          </div>
          <div className="flex items-center gap-2">
            <nav className="flex gap-1.5 overflow-x-auto">
              {visibleLinks.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={`${to}${query}`}
                  end={end}
                  className={({ isActive }) =>
                    `inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold ${
                      isActive ? 'bg-white text-stone-950' : 'text-stone-200 hover:bg-stone-800'
                    }`
                  }
                >
                  <Icon size={15} />
                  {label}
                </NavLink>
              ))}
            </nav>
            <button
              type="button"
              onClick={logout}
              className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-stone-400 hover:bg-stone-800 hover:text-white"
              title="Cerrar sesión"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>
      <main className="container-page py-6 md:py-8">
        <OnboardingWizard />
        <Outlet />
      </main>
    </div>
  );
}
