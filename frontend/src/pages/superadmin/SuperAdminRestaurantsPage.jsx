import { ArrowRight, Building2, ExternalLink, Package, ReceiptText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

export function SuperAdminRestaurantsPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['superadmin', 'restaurants'],
    queryFn: async () => {
      const { data } = await api.get('/superadmin/restaurants');
      return data.restaurants;
    }
  });

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-black">Restaurantes</h1>
        <div className="mt-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-stone-200 bg-white p-6">
              <div className="h-6 w-48 rounded bg-stone-200" />
              <div className="mt-2 h-4 w-32 rounded bg-stone-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-black">Restaurantes</h1>
          <p className="mt-1 text-sm text-stone-600">{data?.length || 0} restaurantes activos</p>
        </div>
        <Link to="/superadmin/new" className="btn-primary">Nuevo restaurante</Link>
      </div>

      <div className="space-y-4">
        {data?.map((restaurant) => (
          <div
            key={restaurant.id}
            className="group cursor-pointer rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-stone-400"
            onClick={() => navigate(`/superadmin/restaurants/${restaurant.id}`)}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-stone-100 text-stone-600">
                  {restaurant.config?.logoUrl ? (
                    <img src={restaurant.config.logoUrl} alt="" className="h-12 w-12 rounded-xl object-cover" />
                  ) : (
                    <Building2 size={22} />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-black">{restaurant.name}</h2>
                  <p className="text-sm text-stone-500">/{restaurant.slug}</p>
                  {restaurant.config?.email && <p className="text-xs text-stone-400 mt-1">{restaurant.config.email}</p>}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-black">{restaurant._count?.orders || 0}</p>
                    <p className="text-xs text-stone-500">pedidos</p>
                  </div>
                  <div className="text-center">
                    <p className="font-black">{restaurant._count?.products || 0}</p>
                    <p className="text-xs text-stone-500">productos</p>
                  </div>
                  <div className="text-center">
                    <p className="font-black">{restaurant._count?.categories || 0}</p>
                    <p className="text-xs text-stone-500">categorias</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/?restaurant=${restaurant.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary text-xs min-h-9"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={14} />
                    Ver tienda
                  </a>
                  <ArrowRight size={18} className="hidden text-stone-300 group-hover:block md:block" />
                </div>
              </div>
            </div>
          </div>
        ))}
        {(!data || data.length === 0) && (
          <div className="rounded-xl border border-stone-200 bg-white p-12 text-center">
            <Building2 size={40} className="mx-auto text-stone-300" />
            <p className="mt-4 font-black text-stone-600">Sin restaurantes</p>
            <p className="mt-1 text-sm text-stone-500">Crea el primer restaurante para empezar.</p>
            <Link to="/superadmin/new" className="btn-primary mt-5">Crear restaurante</Link>
          </div>
        )}
      </div>
    </div>
  );
}
