import { LayoutDashboard, Package, ReceiptText } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Productos', icon: Package },
  { to: '/admin/orders', label: 'Pedidos', icon: ReceiptText }
];

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-white">
      <aside className="border-b border-stone-200 bg-stone-950 text-white">
        <div className="container-page flex min-h-16 flex-wrap items-center justify-between gap-3 py-3">
          <p className="text-base font-black">Panel Admin</p>
          <nav className="flex flex-wrap gap-2">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold ${
                    isActive ? 'bg-white text-stone-950' : 'text-stone-200 hover:bg-stone-800'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
      <main className="container-page py-8">
        <Outlet />
      </main>
    </div>
  );
}

