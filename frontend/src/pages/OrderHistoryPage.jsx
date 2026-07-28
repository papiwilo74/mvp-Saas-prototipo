import { useEffect, useState } from 'react';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { SEOHead } from '../components/seo/SEOHead';
import { StatusBadge } from '../components/ui/StatusBadge';
import { api } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';

export function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/mine').then(({ data }) => setOrders(data.orders)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container-page py-10">
        <Skeleton className="h-8 w-56 mb-6" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-md border border-stone-200 bg-white p-5">
              <Skeleton className="h-5 w-32 mb-3" />
              <Skeleton className="h-4 w-48 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container-page py-10">
        <SEOHead title="Mis pedidos" />
        <EmptyState title="Aun no tienes pedidos" description="Tus compras apareceran aqui cuando crees un pedido." />
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <SEOHead title="Mis pedidos" />
      <h1 className="text-2xl font-black">Historial de pedidos</h1>
      <div className="mt-6 grid gap-4">
        {orders.map((order) => (
          <article key={order.id} className="rounded-md border border-stone-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-black">Pedido #{order.orderNumber}</h2>
                <p className="text-sm text-stone-600">{formatDate(order.createdAt)}</p>
              </div>
              <StatusBadge status={order.status} />
            </div>
            <div className="mt-4 space-y-2 text-sm">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-3">
                  <span>{item.quantity}x {item.product.name}</span>
                  <span className="font-bold">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-right text-lg font-black">{formatCurrency(order.total)}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
