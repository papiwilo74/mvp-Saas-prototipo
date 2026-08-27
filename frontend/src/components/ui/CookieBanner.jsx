import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, ShieldCheck, X } from 'lucide-react';

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('ff_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('ff_cookie_consent', 'accepted');
    setShow(false);
  };

  const acceptEssential = () => {
    localStorage.setItem('ff_cookie_consent', 'essential_only');
    setShow(false);
  };

  if (!show) return null;

  return (
    <aside
      aria-label="Consentimiento de Cookies"
      className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-xl animate-fade-in-up rounded-3xl border border-stone-200/90 bg-white/95 p-5 shadow-2xl backdrop-blur-md md:bottom-6 md:left-6 md:right-auto"
    >
      <div className="flex items-start gap-3.5">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-800">
          <Cookie size={22} />
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-black text-stone-900 flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-600" />
              Tu privacidad y uso de cookies
            </h3>
            <button
              type="button"
              onClick={acceptEssential}
              className="text-stone-400 hover:text-stone-700"
              aria-label="Cerrar aviso de cookies"
            >
              <X size={16} />
            </button>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-stone-600">
            Usamos cookies técnicas y almacenamiento local estrictamente necesarios para mantener tu sesión, guardar tu carrito y recordar preferencias. No usamos cookies publicitarias ni de seguimiento.{' '}
            <Link to="/privacy" className="font-bold underline text-stone-900 hover:text-amber-700">
              Ver Política de Privacidad
            </Link>
            .
          </p>
          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={acceptAll}
              className="rounded-full bg-stone-950 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-stone-800 active:scale-95 shadow-sm"
            >
              Entendido
            </button>
            <button
              type="button"
              onClick={acceptEssential}
              className="rounded-full border border-stone-300 bg-stone-50 px-3.5 py-2 text-xs font-bold text-stone-700 transition-all hover:bg-white active:scale-95"
            >
              Solo necesarias
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
