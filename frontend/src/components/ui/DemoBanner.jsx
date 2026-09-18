import { env } from '../../config/env';
import { useRestaurantConfig } from '../../context/RestaurantConfigContext';

export function DemoBanner() {
  const { activeSlug } = useRestaurantConfig() || {};
  const currentSlug = activeSlug || env.restaurantSlug;

  // Solo mostrar si el slug activo explícitamente pertenece a una demo
  if (!currentSlug || !currentSlug.toLowerCase().includes('demo')) return null;

  return (
    <div className="bg-amber-500 px-4 py-1.5 text-center text-xs font-bold uppercase tracking-wider text-amber-950">
      Entorno de demostración &middot; Los datos mostrados son de prueba
    </div>
  );
}
