import { useEffect, useState } from 'react';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge } from '../components/ui/StatusBadge';
import { api } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';

export function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get('/orders/mine').then(({ data }) => setOrders(data.orders));
  }, []);

  if (orders.length === 0) {
    return (
      <div className="container-page py-10">
        <EmptyState title="Aun no tienes pedidos" description="Tus compras apareceran aqui cuando crees un pedido." />
      </div>
    );
  }

  return (
    <div className="container-page py-10">
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
