import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

const cards = [
  ['today', 'Ventas hoy'],
  ['week', 'Ventas semana'],
  ['month', 'Ventas mes']
];

export function AdminDashboardPage() {
  const { data: summary } = useQuery({
    queryKey: ['reports', 'summary'],
    queryFn: async () => {
      const { data } = await api.get('/reports/summary');
      return data.summary;
    }
  });

  const { data: topProducts = [] } = useQuery({
    queryKey: ['reports', 'top-products'],
    queryFn: async () => {
      const { data } = await api.get('/reports/top-products');
      return data.products;
    }
  });

  return (
    <div>
      <h1 className="text-2xl font-black">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {cards.map(([key, label]) => (
          <div key={key} className="rounded-md border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-stone-600">{label}</p>
            <p className="mt-2 text-2xl font-black">{formatCurrency(summary?.[key]?.revenue || 0)}</p>
            <p className="mt-1 text-xs font-bold text-stone-500">{summary?.[key]?.orders || 0} pedidos</p>
          </div>
        ))}
      </div>

      <section className="mt-6 rounded-md border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black">Productos mas vendidos</h2>
        <div className="mt-4 space-y-3">
          {topProducts.map((product, index) => (
            <div key={product.productId} className="grid grid-cols-[32px_1fr_auto] items-center gap-3 rounded-md bg-stone-50 p-3 text-sm">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-stone-950 font-black text-white">{index + 1}</span>
              <div>
                <p className="font-black">{product.name}</p>
                <p className="text-xs text-stone-500">{product.quantity} unidades</p>
              </div>
              <p className="font-black">{formatCurrency(product.revenue)}</p>
            </div>
          ))}
          {topProducts.length === 0 && <p className="text-sm text-stone-600">Todavia no hay ventas para mostrar.</p>}
        </div>
      </section>
    </div>
  );
}
