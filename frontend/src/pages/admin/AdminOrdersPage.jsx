import { Bell, MessageSquare } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { api } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

const statuses = [
  ['PENDING', 'Pendiente'],
  ['PREPARING', 'Preparando'],
  ['ON_THE_WAY', 'Listo / en camino'],
  ['DELIVERED', 'Entregado'],
  ['CANCELLED', 'Cancelado']
];

const statusTone = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  PREPARING: 'bg-blue-100 text-blue-800 border-blue-200',
  ON_THE_WAY: 'bg-purple-100 text-purple-800 border-purple-200',
  DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200'
};

const playNotification = () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, context.currentTime);
  oscillator.frequency.setValueAtTime(660, context.currentTime + 0.12);
  gain.gain.setValueAtTime(0.001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.2, context.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.35);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.38);
};

export function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({ status: '', from: '', to: '' });
  const [soundEnabled, setSoundEnabled] = useState(false);
  const seenOrders = useRef(new Set());
  const initialized = useRef(false);

  const loadOrders = useCallback(() => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));

    return api.get('/orders/admin', { params }).then(({ data }) => {
      const incomingIds = data.orders.map((order) => order.id);
      const hasNewOrder = initialized.current && incomingIds.some((id) => !seenOrders.current.has(id));

      if (hasNewOrder && soundEnabled) playNotification();

      seenOrders.current = new Set(incomingIds);
      initialized.current = true;
      setOrders(data.orders);
    });
  }, [filters, soundEnabled]);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 15000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  const updateStatus = async (orderId, status) => {
    await api.patch(`/orders/${orderId}/status`, { status });
    loadOrders();
  };

  const updateFilter = (field, value) => setFilters((current) => ({ ...current, [field]: value }));

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-black">Gestion de pedidos</h1>
          <p className="mt-1 text-sm text-stone-600">Estados visuales, filtros y aviso sonoro para pedidos nuevos.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSoundEnabled((current) => !current);
            if (!soundEnabled) playNotification();
          }}
          className={`btn-secondary min-h-10 ${soundEnabled ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : ''}`}
        >
          <Bell size={17} />
          {soundEnabled ? 'Sonido activo' : 'Activar sonido'}
        </button>
      </div>

      <div className="mt-5 grid gap-3 rounded-md border border-stone-200 bg-white p-4 sm:grid-cols-4">
        <label className="block space-y-1">
          <span className="label">Estado</span>
          <select className="input" value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}>
            <option value="">Todos</option>
            {statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="block space-y-1">
          <span className="label">Desde</span>
          <input className="input" type="date" value={filters.from} onChange={(event) => updateFilter('from', event.target.value)} />
        </label>
        <label className="block space-y-1">
          <span className="label">Hasta</span>
          <input className="input" type="date" value={filters.to} onChange={(event) => updateFilter('to', event.target.value)} />
        </label>
        <div className="flex items-end">
          <button type="button" className="btn-secondary min-h-11 w-full" onClick={() => setFilters({ status: '', from: '', to: '' })}>
            Limpiar
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-md border border-stone-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-stone-100 text-stone-700">
              <tr>
                <th className="p-3">Pedido</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Total</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Cambiar</th>
                <th className="p-3">WhatsApp</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const phone = (order.customerPhone || '').replace(/\D/g, '');
                const whatsappUrl = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(`Hola ${order.customerName}, tu pedido #${order.orderNumber} esta en estado ${order.status}.`)}` : '';

                return (
                  <tr key={order.id} className="border-t border-stone-200">
                    <td className="p-3 font-bold">#{order.orderNumber}</td>
                    <td className="p-3">
                      <p className="font-bold">{order.customerName}</p>
                      {order.customerPhone && <p className="text-xs text-stone-500">{order.customerPhone}</p>}
                      {order.customerAddress && <p className="max-w-[220px] truncate text-xs text-stone-500">{order.customerAddress}</p>}
                    </td>
                    <td className="p-3">{formatDate(order.createdAt)}</td>
                    <td className="p-3 font-bold">{formatCurrency(order.total)}</td>
                    <td className="p-3">
                      <span className={`inline-flex min-h-8 items-center rounded-md border px-2 text-xs font-black ${statusTone[order.status] || ''}`}>
                        <StatusBadge status={order.status} />
                      </span>
                    </td>
                    <td className="p-3">
                      <select className="input min-h-10" value={order.status} onChange={(event) => updateStatus(order.id, event.target.value)}>
                        {statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                    </td>
                    <td className="p-3">
                      {whatsappUrl ? (
                        <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn-secondary min-h-10 px-3" aria-label="WhatsApp cliente">
                          <MessageSquare size={17} />
                        </a>
                      ) : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}