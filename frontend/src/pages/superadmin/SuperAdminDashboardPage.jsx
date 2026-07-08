import { Building2, Package, ReceiptText, TrendingUp, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

export function SuperAdminDashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ['superadmin', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/superadmin/stats');
      return data;
    }
  });

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-black">Panel de control</h1>
        <p className="mt-1 text-sm text-stone-600">Resumen general de todos los restaurantes.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-700">
              <Building2 size={18} />
            </span>
            <div>
              <p className="text-2xl font-black">{stats?.totalRestaurants || 0}</p>
              <p className="text-xs font-bold text-stone-500">Restaurantes</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-100 text-blue-700">
              <ReceiptText size={18} />
            </span>
            <div>
              <p className="text-2xl font-black">{stats?.totalOrders || 0}</p>
              <p className="text-xs font-bold text-stone-500">Pedidos totales</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
              <TrendingUp size={18} />
            </span>
            <div>
              <p className="text-2xl font-black">{stats?.activeToday || 0}</p>
              <p className="text-xs font-bold text-stone-500">Pedidos hoy</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-purple-100 text-purple-700">
              <Package size={18} />
            </span>
            <div>
              <p className="text-2xl font-black">{stats?.totalProducts || 0}</p>
              <p className="text-xs font-bold text-stone-500">Productos</p>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-6 rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black">Pedidos recientes (todos los restaurantes)</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-stone-50 text-stone-600">
              <tr>
                <th className="p-3">Pedido</th>
                <th className="p-3">Restaurante</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Total</th>
                <th className="p-3">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders?.map((order) => (
                <tr key={order.id} className="border-t border-stone-100">
                  <td className="p-3 font-bold">#{order.orderNumber}</td>
                  <td className="p-3">{order.restaurantName}</td>
                  <td className="p-3">{order.customerName}</td>
                  <td className="p-3 font-bold">{formatCurrency(order.total)}</td>
                  <td className="p-3 text-stone-500">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
              {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                <tr><td colSpan={5} className="p-6 text-center text-stone-500">Sin pedidos todavia</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
