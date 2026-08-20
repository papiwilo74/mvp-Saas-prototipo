import { useState } from 'react';
import {
  Calendar,
  Download,
  FileSpreadsheet,
  DollarSign,
  ShoppingBag,
  UsersRound,
  Timer,
  TrendingUp,
  Star,
  Award,
  Clock
} from 'lucide-react';
import { api } from '../../services/api';
import { useApiQuery, apiQueryKey } from '../../hooks/useApiQuery';
import { formatCurrency } from '../../utils/formatters';

export function AdminAnalyticsPage() {
  const [daysFilter, setDaysFilter] = useState(30);
  const [exportFrom, setExportFrom] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [exportTo, setExportTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [exporting, setExporting] = useState(false);

  const { data: summary } = useApiQuery(
    apiQueryKey('analytics', 'dashboard-summary'),
    async () => {
      const { data } = await api.get('/analytics/dashboard');
      return data;
    }
  );

  const { data: peakHours } = useApiQuery(
    apiQueryKey('analytics', 'peak-hours', daysFilter),
    async () => {
      const { data } = await api.get(`/analytics/peak-hours?days=${daysFilter}`);
      return data;
    }
  );

  const { data: revenueByDay } = useApiQuery(
    apiQueryKey('analytics', 'revenue-by-day', daysFilter),
    async () => {
      const { data } = await api.get(`/analytics/revenue-by-day?days=${daysFilter}`);
      return data;
    }
  );

  const { data: frequentCustomers } = useApiQuery(
    apiQueryKey('analytics', 'frequent-customers'),
    async () => {
      const { data } = await api.get('/analytics/frequent-customers?limit=8');
      return data;
    }
  );

  const maxPeakCount = Math.max(1, ...(peakHours || []).map((h) => h.count));
  const maxRevenue = Math.max(1, ...(revenueByDay || []).map((d) => d.revenue));

  const busiestHour = peakHours?.reduce((prev, curr) => (curr.count > prev.count ? curr : prev), { hour: 0, count: 0 });

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await api.get(`/export/orders?from=${exportFrom}&to=${exportTo}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte-contable-${exportFrom}-a-${exportTo}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error al exportar reporte contable', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-stone-900">Analítica y Reportes Contables</h1>
          <p className="mt-1 text-sm text-stone-600">
            Métricas de ventas en tiempo real, horas pico de cocina y exportación para contabilidad.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setDaysFilter(7)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              daysFilter === 7 ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            7 días
          </button>
          <button
            type="button"
            onClick={() => setDaysFilter(30)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              daysFilter === 30 ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            30 días
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Ventas este mes</span>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-stone-900">{formatCurrency(summary?.monthRevenue || 0)}</p>
          <p className="mt-1 text-xs text-stone-500">{summary?.monthOrders || 0} pedidos procesados</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Ticket Promedio</span>
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-stone-900">{formatCurrency(summary?.monthAverageOrderValue || summary?.averageOrderValue || 0)}</p>
          <p className="mt-1 text-xs text-stone-500">Promedio por orden</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Pedidos Hoy</span>
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
              <ShoppingBag size={20} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-stone-900">{summary?.todayOrders || 0}</p>
          <p className="mt-1 text-xs text-stone-500">Total histórico: {summary?.totalOrders || 0}</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Clientes Registrados</span>
            <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600">
              <UsersRound size={20} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-stone-900">{summary?.totalCustomers || 0}</p>
          <p className="mt-1 text-xs text-stone-500">Base de datos propia</p>
        </div>
      </div>

      <div className="rounded-2xl border border-stone-900/10 bg-gradient-to-r from-stone-900 to-stone-800 p-6 text-white shadow-md">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="text-emerald-400" size={22} />
              <h2 className="text-lg font-black tracking-tight">Exportación Contable para Excel / DIAN</h2>
            </div>
            <p className="text-xs text-stone-300">
              Descarga el libro de ventas con detalle de impuestos, zonas, métodos de pago y totales en formato .CSV con soporte UTF-8.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs backdrop-blur-md">
              <Calendar size={14} className="text-stone-300" />
              <input
                type="date"
                value={exportFrom}
                onChange={(e) => setExportFrom(e.target.value)}
                className="bg-transparent text-xs font-bold text-white outline-none"
              />
              <span className="text-stone-400">a</span>
              <input
                type="date"
                value={exportTo}
                onChange={(e) => setExportTo(e.target.value)}
                className="bg-transparent text-xs font-bold text-white outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleExportCSV}
              disabled={exporting}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-black text-stone-950 transition-all hover:bg-emerald-400 active:scale-95 disabled:opacity-50"
            >
              <Download size={15} />
              {exporting ? 'Generando...' : 'Descargar Excel / CSV'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-600" />
              <h2 className="text-base font-black text-stone-900">Tendencia de Ingresos ({daysFilter} días)</h2>
            </div>
            <span className="text-xs font-bold text-stone-500">Pesos ($ COP)</span>
          </div>

          <div className="flex h-44 items-end gap-1.5 pt-4">
            {revenueByDay?.slice(-14).map((d) => (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[10px] font-bold text-stone-600">
                  {d.revenue > 0 ? `${Math.round(d.revenue / 1000)}k` : ''}
                </span>
                <div
                  className="w-full rounded-t-lg bg-emerald-500 transition-all duration-300 hover:bg-emerald-600"
                  style={{
                    height: `${(d.revenue / maxRevenue) * 100}%`,
                    opacity: 0.35 + (d.revenue / maxRevenue) * 0.65,
                    minHeight: d.revenue > 0 ? 6 : 2
                  }}
                  title={`${d.date}: ${formatCurrency(d.revenue)} (${d.orders} pedidos)`}
                />
                <span className="text-[10px] font-medium text-stone-400">{d.date.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer size={18} className="text-[color:var(--color-primary)]" />
              <h2 className="text-base font-black text-stone-900">Horas Pico de Cocina</h2>
            </div>
            {busiestHour && busiestHour.count > 0 && (
              <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800">
                <Clock size={12} />
                Pico: {busiestHour.label} ({busiestHour.count} pedidos)
              </div>
            )}
          </div>

          <div className="flex h-44 items-end gap-1 pt-4">
            {peakHours?.map((h) => (
              <div key={h.hour} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-stone-600">{h.count || ''}</span>
                <div
                  className="w-full rounded-t-lg bg-[color:var(--color-primary)] transition-all duration-300"
                  style={{
                    height: `${(h.count / maxPeakCount) * 100}%`,
                    opacity: 0.25 + (h.count / maxPeakCount) * 0.75,
                    minHeight: h.count > 0 ? 6 : 2
                  }}
                  title={`${h.label}: ${h.count} pedidos`}
                />
                <span className="text-[10px] text-stone-400">
                  {h.hour % 3 === 0 || h.hour === 0 ? `${h.hour}h` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Award size={18} className="text-amber-500" />
            <h2 className="text-base font-black text-stone-900">Productos Estrella (Top Ventas)</h2>
          </div>

          <div className="space-y-3">
            {summary?.topProducts?.map((p, index) => {
              const maxProdQty = summary.topProducts[0]?.quantity || 1;
              const percent = Math.round((p.quantity / maxProdQty) * 100);

              return (
                <div key={p.productId} className="space-y-1.5 rounded-xl bg-stone-50 p-3.5 text-sm">
                  <div className="flex items-center justify-between font-bold">
                    <div className="flex items-center gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-stone-900 text-xs font-black text-white">
                        {index + 1}
                      </span>
                      <span className="text-stone-900">{p.name}</span>
                    </div>
                    <span className="font-black text-stone-900">{formatCurrency(p.revenue)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>{p.quantity} unidades vendidas</span>
                    <span>{percent}% del líder</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {(!summary?.topProducts || summary.topProducts.length === 0) && (
              <p className="py-6 text-center text-xs text-stone-400">Aún no hay suficientes ventas para generar el ranking.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <UsersRound size={18} className="text-purple-600" />
            <h2 className="text-base font-black text-stone-900">Clientes VIP y Fidelización</h2>
          </div>

          <div className="space-y-2.5">
            {frequentCustomers?.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3 rounded-xl bg-stone-50 p-3 text-sm">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-stone-900 text-xs font-black text-white">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-stone-900">{c.name}</p>
                  <p className="text-xs text-stone-500">{c.phone} · {c.orderCount} pedidos</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-stone-900">{formatCurrency(c.totalSpent)}</p>
                  <div className="flex items-center justify-end gap-1 text-xs font-bold text-amber-600">
                    <Star size={11} className="fill-amber-500" />
                    {c.points} pts · {c.tier}
                  </div>
                </div>
              </div>
            ))}

            {(!frequentCustomers || frequentCustomers.length === 0) && (
              <p className="py-6 text-center text-xs text-stone-400">Sin datos de clientes frecuentes todavía.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
