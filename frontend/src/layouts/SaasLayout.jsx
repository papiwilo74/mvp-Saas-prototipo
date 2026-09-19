import { Zap } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';
import { InstallPrompt } from '../components/ui/InstallPrompt';
import { CookieBanner } from '../components/ui/CookieBanner';

export function SaasLayout({ children }) {
  return (
    <div className="app-shell flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="container-page flex items-center justify-between py-3.5">
          <Link to="/saas" className="group flex items-center gap-2.5 text-stone-900">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-sm shadow-orange-500/20 transition-transform group-hover:scale-105">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <div className="leading-none">
              <span className="text-lg font-black tracking-tight">OrderFlow</span>
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
            <Link to="/registro" className="btn-primary min-h-10 px-4 text-xs font-black shadow-sm">
              Probar 14 días gratis
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children || <Outlet />}
      </main>

      <footer className="mt-auto border-t border-stone-200 bg-white py-6 text-center text-xs text-stone-500">
        <div className="container-page flex flex-wrap items-center justify-center gap-4">
          <Link to="/terms" className="font-semibold hover:text-stone-950 transition-colors">Términos de Servicio</Link>
          <span className="text-stone-300">•</span>
          <Link to="/privacy" className="font-semibold hover:text-stone-950 transition-colors">Política de Privacidad</Link>
          <span className="text-stone-300">•</span>
          <span>&copy; {new Date().getFullYear()} OrderFlow. Todos los derechos reservados.</span>
        </div>
      </footer>

      <InstallPrompt />
      <CookieBanner />
    </div>
  );
}
