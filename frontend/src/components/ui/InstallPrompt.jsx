import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setShow(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShow(false);
    setDeferredPrompt(null);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
      <div className="mx-auto max-w-md rounded-2xl border border-stone-200 bg-white p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 text-white text-xs font-black">
            FF
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black">Instala la app</p>
            <p className="mt-0.5 text-xs text-stone-500">Agrégala a tu pantalla de inicio para pedir más rápido.</p>
          </div>
          <button onClick={handleDismiss} className="shrink-0 rounded-full p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600">
            <X size={16} />
          </button>
        </div>
        <button
          onClick={handleInstall}
          className="mt-3 w-full rounded-xl bg-stone-950 py-2.5 text-sm font-bold text-white transition-colors hover:bg-stone-800"
        >
          Instalar
        </button>
      </div>
    </div>
  );
}
