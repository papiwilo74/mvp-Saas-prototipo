import { ArrowLeft, Building2, ExternalLink, Package, ReceiptText, UsersRound } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

export function SuperAdminRestaurantDetailPage() {
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['superadmin', 'restaurant', id],
    queryFn: async () => {
      const { data } = await api.get(`/superadmin/restaurants/${id}`);
      return data.restaurant;
    }
  });

  if (isLoading) {
    return (
      <div>
        <Link to="/superadmin/restaurants" className="text-sm font-bold text-stone-500 hover:text-stone-800">
          <ArrowLeft size={16} className="inline mr-1" /> Volver
        </Link>
        <div className="mt-4 animate-pulse rounded-xl border border-stone-200 bg-white p-6">
          <div className="h-8 w-48 rounded bg-stone-200" />
          <div className="mt-4 h-20 rounded bg-stone-100" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <Link to="/superadmin/restaurants" className="text-sm font-bold text-stone-500">Volver a restaurantes</Link>
        <p className="mt-6 text-stone-600">Restaurante no encontrado.</p>
      </div>
    );
  }

  return (
    <div>
      <Link to="/superadmin/restaurants" className="text-sm font-bold text-stone-500 hover:text-stone-800">
        <ArrowLeft size={16} className="inline mr-1" /> Volver a restaurantes
      </Link>

      <div className="mt-4 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-stone-100">
              {data.config?.logoUrl ? (
                <img src={data.config.logoUrl} alt="" className="h-14 w-14 rounded-xl object-cover" />
              ) : (
                <Building2 size={24} className="text-stone-500" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black">{data.name}</h1>
              <p className="text-stone-500">/{data.slug}</p>
              {data.config?.email && <p className="text-sm text-stone-400 mt-1">{data.config.email}</p>}
              {data.phone && <p className="text-sm text-stone-400">{data.phone}</p>}
            </div>
          </div>
          <a
            href={`/?restaurant=${data.slug}`}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
          >
            <ExternalLink size={16} />
            Abrir tienda
          </a>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-stone-50 p-4 text-center">
            <ReceiptText size={18} className="mx-auto text-stone-400" />
            <p className="mt-2 text-2xl font-black">{data._count?.orders || 0}</p>
            <p className="text-xs text-stone-500">pedidos</p>
          </div>
          <div className="rounded-lg bg-stone-50 p-4 text-center">
            <Package size={18} className="mx-auto text-stone-400" />
            <p className="mt-2 text-2xl font-black">{data._count?.products || 0}</p>
            <p className="text-xs text-stone-500">productos</p>
          </div>
          <div className="rounded-lg bg-stone-50 p-4 text-center">
            <Package size={18} className="mx-auto text-stone-400" />
            <p className="mt-2 text-2xl font-black">{data.categories?.length || 0}</p>
            <p className="text-xs text-stone-500">categorias</p>
          </div>
          <div className="rounded-lg bg-stone-50 p-4 text-center">
            <ReceiptText size={18} className="mx-auto text-stone-400" />
            <p className="mt-2 text-2xl font-black">{data.config ? 'Si' : 'No'}</p>
            <p className="text-xs text-stone-500">configurado</p>
          </div>
        </div>
      </div>

      {data.config && (
        <div className="mt-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black">Configuracion actual</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 text-sm">
            <div>
              <p className="font-bold text-stone-500">Color primario</p>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-6 w-6 rounded border" style={{ backgroundColor: data.config.primaryColor }} />
                <span>{data.config.primaryColor}</span>
              </div>
            </div>
            <div>
              <p className="font-bold text-stone-500">WhatsApp</p>
              <p className="mt-1">{data.config.whatsapp || '-'}</p>
            </div>
            <div>
              <p className="font-bold text-stone-500">Domicilio</p>
              <p className="mt-1">{formatCurrency(data.config.deliveryFee || 0)}</p>
            </div>
            <div>
              <p className="font-bold text-stone-500">Pagos activos</p>
              <p className="mt-1">{(data.config.paymentMethods || []).join(', ') || 'Ninguno'}</p>
            </div>
            <div>
              <p className="font-bold text-stone-500">Pedidos programables</p>
              <p className="mt-1">{data.config.acceptsScheduledOrders ? 'Si' : 'No'}</p>
            </div>
            <div>
              <p className="font-bold text-stone-500">Zonas de entrega</p>
              <p className="mt-1">{(data.config.deliveryZones || []).length}</p>
            </div>
            {data.config.wompiPublicKey && (
              <div>
                <p className="font-bold text-stone-500">Wompi</p>
                <p className="mt-1 text-emerald-600 font-bold">Configurado</p>
              </div>
            )}
            {data.config.loyaltyProgram?.enabled && (
              <div>
                <p className="font-bold text-stone-500">Fidelizacion</p>
                <p className="mt-1 text-emerald-600 font-bold">Activado</p>
              </div>
            )}
          </div>
        </div>
      )}

      {data.categories?.length > 0 && (
        <div className="mt-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black">Categorias y productos</h2>
          <div className="mt-4 space-y-3">
            {data.categories.map((cat) => (
              <div key={cat.id} className="rounded-lg bg-stone-50 p-4">
                <p className="font-bold">{cat.name} <span className="text-stone-400 font-normal">({cat.products?.length || 0} productos)</span></p>
                {cat.products?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {cat.products.slice(0, 8).map((p) => (
                      <span key={p.id} className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-semibold">
                        {p.name} - {formatCurrency(p.price)}
                      </span>
                    ))}
                    {cat.products.length > 8 && (
                      <span className="text-xs text-stone-400">+{cat.products.length - 8} mas</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
