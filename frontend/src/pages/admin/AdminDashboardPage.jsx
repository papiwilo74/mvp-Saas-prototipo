import { DollarSign, ShoppingBag, TrendingUp, UsersRound } from 'lucide-react';
import { useApiQuery, apiQueryKey } from '../../hooks/useApiQuery';
import { StatCard } from '../../components/ui/StatCard';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { Skeleton } from '../../components/ui/Skeleton';

export function AdminDashboardPage() {
  const { data: summary, isLoading: summaryLoading } = useApiQuery(
    apiQueryKey('reports', 'summary'),
    async () => {
      const { data } = await api.get('/reports/summary');
      return data.summary;
    }
  );

  const { data: topProducts = [], isLoading: productsLoading } = useApiQuery(
    apiQueryKey('reports', 'top-products'),
    async () => {
      const { data } = await api.get('/reports/top-products');
      return data.products;
    }
  );

  const { data: analytics, isLoading: analyticsLoading } = useApiQuery(
    apiQueryKey('analytics', 'dashboard-summary'),
    async () => {
      const { data } = await api.get('/analytics/dashboard-summary');
      return data;
    }
  );

  const kpiCards = [
    { label: 'Ventas hoy', value: formatCurrency(summary?.today?.revenue || 0), sub: `${summary?.today?.orders || 0} pedidos`, icon: DollarSign, color: 'emerald' },
    { label: 'Ventas esta semana', value: formatCurrency(summary?.week?.revenue || 0), sub: `${summary?.week?.orders || 0} pedidos`, icon: TrendingUp, color: 'blue' },
    { label: 'Ventas este mes', value: formatCurrency(summary?.month?.revenue || 0), sub: `${summary?.month?.orders || 0} pedidos`, icon: ShoppingBag, color: 'orange' },
    { label: 'Valor promedio', value: formatCurrency(analytics?.averageOrderValue || 0), sub: `${analytics?.totalOrders || 0} pedidos totales`, icon: DollarSign, color: 'purple' },
    { label: 'Clientes registrados', value: analytics?.totalCustomers || 0, sub: `${analytics?.todayOrders || 0} hoy`, icon: UsersRound, color: 'stone' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-black">Dashboard</h1>
      <p className="mt-1 text-sm text-stone-600">Resumen de operacion del restaurante.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {kpiCards.map((kpi) => (
          <StatCard key={kpi.label} {...kpi} loading={summaryLoading || analyticsLoading} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black">Productos mas vendidos</h2>
          <div className="mt-4 space-y-2">
            {productsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-stone-50 p-3">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <div className="flex-1"><Skeleton className="h-4 w-32" /></div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))
            ) : topProducts.length === 0 ? (
              <p className="text-sm text-stone-500 py-4 text-center">Todavia no hay ventas.</p>
            ) : (
              topProducts.map((product, index) => (
                <div key={product.productId} className="grid grid-cols-[32px_1fr_auto] items-center gap-3 rounded-lg bg-stone-50 p-3 text-sm">
                  <span className="grid h-8 w-8 place-items-center rounded-md bg-stone-950 font-black text-white">{index + 1}</span>
                  <div>
                    <p className="font-black truncate">{product.name}</p>
                    <p className="text-xs text-stone-500">{product.quantity} unidades</p>
                  </div>
                  <p className="font-black">{formatCurrency(product.revenue)}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-black">Pedidos por estado</h2>
          <div className="mt-4 space-y-3">
            {analyticsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-2 flex-1 rounded-full" />
                  <Skeleton className="h-4 w-8" />
                </div>
              ))
            ) : !analytics?.statusBreakdown || Object.keys(analytics.statusBreakdown).length === 0 ? (
              <p className="text-sm text-stone-500 py-4 text-center">Sin pedidos registrados.</p>
            ) : (
              (() => {
                const breakdown = analytics.statusBreakdown;
                const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
                const labels = { PENDING: 'Pendientes', PREPARING: 'Preparando', ON_THE_WAY: 'En camino', DELIVERED: 'Entregados', CANCELLED: 'Cancelados' };
                const colors = { PENDING: 'bg-amber-500', PREPARING: 'bg-blue-500', ON_THE_WAY: 'bg-purple-500', DELIVERED: 'bg-emerald-500', CANCELLED: 'bg-red-400' };

                return Object.entries(breakdown).map(([status, count]) => (
                  <div key={status} className="flex items-center gap-3 text-sm">
                    <span className="w-24 font-semibold text-stone-600">{labels[status] || status}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
                      <div className={`h-full rounded-full transition-all ${colors[status] || 'bg-stone-500'}`} style={{ width: `${(count / total) * 100}%` }} />
                    </div>
                    <span className="w-8 text-right font-bold">{count}</span>
                  </div>
                ));
              })()
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
