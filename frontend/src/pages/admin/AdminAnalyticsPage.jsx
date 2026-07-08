import { Star, Timer, TrendingUp, UsersRound } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

export function AdminAnalyticsPage() {
  const { data: peakHours } = useQuery({
    queryKey: ['analytics', 'peak-hours'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/peak-hours');
      return data;
    }
  });

  const { data: revenueByDay } = useQuery({
    queryKey: ['analytics', 'revenue-by-day'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/revenue-by-day');
      return data;
    }
  });

  const { data: frequentCustomers } = useQuery({
    queryKey: ['analytics', 'frequent-customers'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/frequent-customers');
      return data;
    }
  });

  const maxPeakCount = Math.max(1, ...(peakHours || []).map((h) => h.count));
  const maxRevenue = Math.max(1, ...(revenueByDay || []).map((d) => d.revenue));

  return (
    <div>
      <h1 className="text-2xl font-black">Reportes avanzados</h1>
      <p className="mt-1 text-sm text-stone-600">Horas pico, tendencias de ventas y clientes frecuentes.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Timer size={18} className="text-[color:var(--color-primary)]" />
            <h2 className="text-lg font-black">Horas pico (30 dias)</h2>
          </div>
          <div className="flex items-end gap-1 h-40">
            {peakHours?.map((h) => (
              <div key={h.hour} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-stone-600">{h.count || ''}</span>
                <div
                  className="w-full rounded-t bg-[color:var(--color-primary)] transition-all"
                  style={{ height: `${(h.count / maxPeakCount) * 100}%`, opacity: 0.3 + (h.count / maxPeakCount) * 0.7, minHeight: h.count > 0 ? 4 : 1 }}
                />
                <span className="text-xs text-stone-400">{h.hour % 3 === 0 || h.hour === 0 ? h.label : ''}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-[color:var(--color-primary)]" />
            <h2 className="text-lg font-black">Ingresos (30 dias)</h2>
          </div>
          <div className="flex items-end gap-1 h-40">
            {revenueByDay?.slice(-14).map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-bold text-stone-600">{d.revenue > 0 ? `${Math.round(d.revenue / 1000)}k` : ''}</span>
                <div
                  className="w-full rounded-t bg-emerald-500 transition-all"
                  style={{ height: `${(d.revenue / maxRevenue) * 100}%`, opacity: 0.4 + (d.revenue / maxRevenue) * 0.6, minHeight: d.revenue > 0 ? 4 : 1 }}
                />
                <span className="text-xs text-stone-400">{d.date.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <UsersRound size={18} className="text-[color:var(--color-primary)]" />
            <h2 className="text-lg font-black">Clientes frecuentes</h2>
          </div>
          <div className="space-y-2">
            {frequentCustomers?.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3 rounded-lg bg-stone-50 p-3 text-sm">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-stone-950 text-xs font-black text-white">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{c.name}</p>
                  <p className="text-xs text-stone-500">{c.phone} · {c.orderCount} pedidos</p>
                </div>
                <div className="text-right">
                  <p className="font-black">{formatCurrency(c.totalSpent)}</p>
                  <div className="flex items-center justify-end gap-1 text-xs text-amber-600 font-bold">
                    <Star size={12} />
                    {c.points} pts · {c.tier}
                  </div>
                </div>
              </div>
            ))}
            {(!frequentCustomers || frequentCustomers.length === 0) && (
              <p className="text-sm text-stone-500 py-4 text-center">Sin datos de clientes todavia.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-[color:var(--color-primary)]" />
            <h2 className="text-lg font-black">Resumen de ventas</h2>
          </div>
          <div className="space-y-1 text-sm">
            {revenueByDay?.slice(-7).map((d) => (
              <div key={d.date} className="flex items-center justify-between rounded bg-stone-50 px-3 py-2">
                <span className="text-stone-500">{new Date(d.date + 'T00:00:00').toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                <span className="font-bold">{d.orders} pedidos</span>
                <span className="font-black">{formatCurrency(d.revenue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
