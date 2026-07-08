import { CookingPot, LayoutDashboard, Package, ReceiptText, Settings, UsersRound } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Productos', icon: Package },
  { to: '/admin/orders', label: 'Pedidos', icon: ReceiptText },
  { to: '/admin/kitchen', label: 'Cocina', icon: CookingPot },
  { to: '/admin/customers', label: 'Clientes', icon: UsersRound },
  { to: '/admin/settings', label: 'Config', icon: Settings }
];

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-stone-950 text-white">
        <div className="container-page flex min-h-16 flex-wrap items-center justify-between gap-3 py-3">
          <Link to="/" className="text-sm font-bold text-stone-300">Ver tienda</Link>
          <nav className="flex gap-2 overflow-x-auto">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-semibold ${
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
