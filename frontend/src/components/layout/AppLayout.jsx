import { ShoppingCart, UserRound } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export function AppLayout() {
  const { user, logout, isAdmin } = useAuth();
  const { count } = useCart();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link to="/" className="text-lg font-black tracking-normal text-ink">
            Demo Burger
          </Link>
          <nav className="flex items-center gap-2 text-sm font-semibold">
            <NavLink to="/" className="rounded-md px-3 py-2 hover:bg-stone-100">
              Menu
            </NavLink>
            <NavLink to="/orders" className="hidden rounded-md px-3 py-2 hover:bg-stone-100 sm:inline-flex">
              Pedidos
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className="rounded-md px-3 py-2 hover:bg-stone-100">
                Admin
              </NavLink>
            )}
            <Link to="/cart" className="btn-secondary relative px-3" aria-label="Carrito">
              <ShoppingCart size={18} />
              {count > 0 && (
                <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-xs text-white">
                  {count}
                </span>
              )}
            </Link>
            {user ? (
              <button type="button" onClick={logout} className="btn-secondary hidden sm:inline-flex">
                <UserRound size={18} />
                Salir
              </button>
            ) : (
              <Link to="/login" className="btn-primary">
                Ingresar
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

