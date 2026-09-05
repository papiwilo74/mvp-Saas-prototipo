import { Clock3, Home, ShoppingBag, Store } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useRestaurantConfig } from '../context/RestaurantConfigContext';
import { DemoBanner } from '../components/ui/DemoBanner';
import { InstallPrompt } from '../components/ui/InstallPrompt';
import { CookieBanner } from '../components/ui/CookieBanner';

const navItems = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/menu', label: 'Menu', icon: ShoppingBag }
];

export function AppLayout() {
  const { count } = useCart();
  const { config } = useRestaurantConfig();
  const location = useLocation();
  const tenantQuery = location.search;
  const params = new URLSearchParams(location.search);
  const hasRestaurantParam = Boolean(params.get('restaurant'));
  const isSaasRoute = location.pathname === '/saas' || location.pathname === '/registro-restaurante' || location.pathname === '/registro-negocio' || (location.pathname === '/' && !hasRestaurantParam);
  const activeDeliveryZoneCount = (config.deliveryZones || []).filter((zone) => zone.isActive !== false).length;

  return (
    <div className="app-shell flex min-h-screen flex-col">
      {isSaasRoute ? (
        <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
          <div className="container-page flex items-center justify-between py-3.5">
            <Link to="/saas" className="flex items-center gap-2 text-stone-900">
              <span className="text-2xl">🍔</span>
              <div className="leading-none">
                <span className="text-lg font-black tracking-tight">BcaXen</span>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-orange-600">SaaS para negocios</span>
              </div>
            </Link>

            <div className="hidden items-center gap-6 text-sm font-semibold text-stone-600 md:flex">
              <a href="/saas#calculadora" className="hover:text-stone-950 transition-colors">Calculadora de Ahorro</a>
              <Link to="/?restaurant=demo-burger" className="hover:text-stone-950 transition-colors">Ver Demo en Vivo</Link>
            </div>

            <div className="flex items-center gap-2.5">
              <Link to="/login" className="btn-secondary min-h-10 px-3.5 text-xs font-bold">
                Ingreso
              </Link>
              <Link to="/registro-negocio" className="btn-primary min-h-10 px-4 text-xs font-black shadow-sm">
                Probar 14 días gratis
              </Link>
            </div>
          </div>
        </header>
      ) : (
        <header className="sticky top-0 z-30 border-b border-white/60 bg-[#f7f1e8]/90 backdrop-blur">
          <DemoBanner />
          <div className="container-page flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between">
            <Link to={`/${tenantQuery}`} className="flex min-w-0 items-center gap-2">
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
              <Link to="/saas" className="hidden text-xs font-bold text-orange-700 hover:underline sm:inline-block mr-2">
                ¿Crear tu propio SaaS?
              </Link>
              <Link to={`/login${tenantQuery}`} className="btn-secondary min-h-10 px-3 text-sm">Admin</Link>
              <Link to={`/cart${tenantQuery}`} className="btn-primary relative min-h-10 px-3" aria-label="Carrito">
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
      )}

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-auto border-t border-stone-200 bg-white py-6 text-center text-xs text-stone-500">
        <div className="container-page flex flex-wrap items-center justify-center gap-4">
          <Link to="/terms" className="font-semibold hover:text-stone-950 transition-colors">Términos de Servicio</Link>
          <span className="text-stone-300">•</span>
          <Link to="/privacy" className="font-semibold hover:text-stone-950 transition-colors">Política de Privacidad</Link>
        </div>
      </footer>

      {!isSaasRoute && (
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-200 bg-white md:hidden">
          <div className="grid h-16 grid-cols-2">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={`${to}${tenantQuery}`}
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
      )}
      <InstallPrompt />
      <CookieBanner />
    </div>
  );
}
