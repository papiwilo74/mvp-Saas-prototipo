import { useEffect, useState } from 'react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { api } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

const statuses = [
  ['PENDING', 'Pendiente'],
  ['PREPARING', 'Preparando'],
  ['ON_THE_WAY', 'En Camino'],
  ['DELIVERED', 'Entregado'],
  ['CANCELLED', 'Cancelado']
];

export function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);

  const loadOrders = () => api.get('/orders/admin').then(({ data }) => setOrders(data.orders));

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    await api.patch(`/orders/${orderId}/status`, { status });
    loadOrders();
  };

  return (
    <div>
      <h1 className="text-2xl font-black">Gestion de pedidos</h1>
      <div className="mt-6 overflow-hidden rounded-md border border-stone-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-stone-100 text-stone-700">
              <tr>
                <th className="p-3">Pedido</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Total</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Cambiar</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-stone-200">
                  <td className="p-3 font-bold">#{order.orderNumber}</td>
                  <td className="p-3">{order.customerName}</td>
                  <td className="p-3">{formatDate(order.createdAt)}</td>
                  <td className="p-3 font-bold">{formatCurrency(order.total)}</td>
                  <td className="p-3"><StatusBadge status={order.status} /></td>
                  <td className="p-3">
                    <select className="input min-h-10" value={order.status} onChange={(event) => updateStatus(order.id, event.target.value)}>
                      {statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
