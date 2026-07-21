import { Building2, LayoutDashboard, LogOut, Plus } from 'lucide-react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/superadmin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/superadmin/restaurants', label: 'Restaurantes', icon: Building2 }
];

export function SuperAdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-700" style={{ backgroundColor: 'var(--admin-header-bg, #1c1917)' }}>
        <div className="h-1 w-full" style={{ backgroundColor: 'var(--color-primary, #ea580c)' }} />
        <div className="container-page flex min-h-16 flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-4">
            <Link to="/superadmin" className="text-sm font-black tracking-tight text-white">FastFood SaaS</Link>
            <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400">SUPERADMIN</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
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
            <Link to="/superadmin/new" className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg bg-amber-500 px-3 text-sm font-semibold text-white hover:bg-amber-600">
              <Plus size={17} />
              Nuevo restaurante
            </Link>
            <button onClick={handleLogout} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-stone-400 hover:bg-stone-800">
              <LogOut size={17} />
              Salir
            </button>
          </div>
        </div>
      </header>
      <main className="container-page py-6 md:py-8">
        <Outlet />
      </main>
    </div>
  );
}
