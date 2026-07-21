import { env } from '../../config/env';

export function DemoBanner() {
  if (!env.demoMode) return null;

  return (
    <div className="bg-amber-500 px-4 py-1.5 text-center text-xs font-bold uppercase tracking-wider text-amber-950">
      Entorno de demostración &middot; Los datos mostrados son de prueba
    </div>
  );
}
