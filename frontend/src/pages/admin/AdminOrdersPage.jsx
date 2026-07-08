import { Bell, ChevronDown, ChevronUp, Download, MessageSquare } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pagination } from '../../components/ui/Pagination';
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
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, pageSize: 20 });
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const seenOrders = useRef(new Set());
  const initialized = useRef(false);

  const loadOrders = useCallback((page = pagination.page) => {
    const params = { ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value)), page, pageSize: pagination.pageSize };

    return api.get('/orders/admin', { params }).then(({ data }) => {
      const incomingIds = data.orders.map((order) => order.id);
      const newIds = incomingIds.filter((id) => !seenOrders.current.has(id));
      const hasNewOrder = initialized.current && newIds.length > 0;

      if (hasNewOrder) {
        if (soundEnabled) playNotification();
        newIds.forEach((id) => {
          const order = data.orders.find((o) => o.id === id);
          if (order && Notification.permission === 'granted') {
            new Notification(`Nuevo pedido #${order.orderNumber}`, {
              body: `${order.customerName} - ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(order.total))}`,
              icon: '/icons/icon-192.png',
              tag: `order-${order.id}`
            });
          }
        });
      }

      seenOrders.current = new Set(incomingIds);
      initialized.current = true;
      setOrders(data.orders);
      setPagination(data.pagination);
    });
  }, [filters, pagination.page, pagination.pageSize, soundEnabled]);

  useEffect(() => {
    loadOrders(1);
    const interval = setInterval(loadOrders, 15000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  const updateStatus = async (orderId, status) => {
    await api.patch(`/orders/${orderId}/status`, { status });
    loadOrders(pagination.page);
  };

  const updateFilter = (field, value) => setFilters((current) => ({ ...current, [field]: value }));
  const toggleExpand = (orderId) => setExpandedOrder((current) => (current === orderId ? null : orderId));

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-black">Gestion de pedidos</h1>
          <p className="mt-1 text-sm text-stone-600">Estados visuales, filtros y aviso sonoro para pedidos nuevos.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary min-h-10" onClick={async () => {
            const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
            const { data } = await api.get('/export/orders', { params, responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = `pedidos-${new Date().toISOString().slice(0, 10)}.csv`;
            link.click();
            window.URL.revokeObjectURL(url);
          }}>
            <Download size={17} />
            CSV
          </button>
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
          <button
            type="button"
            className="btn-secondary min-h-10"
            onClick={() => {
              if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission();
              }
            }}
          >
            <Bell size={17} />
            {typeof Notification !== 'undefined' && Notification.permission === 'granted' ? 'Notif. activas' : 'Notificaciones'}
          </button>
        </div>
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
                <th className="p-3" />
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
                const isExpanded = expandedOrder === order.id;

                return (
                  <>
                    <tr key={order.id} className="border-t border-stone-200">
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => toggleExpand(order.id)}
                          className="grid h-8 w-8 place-items-center rounded-md hover:bg-stone-100"
                          aria-label={isExpanded ? 'Colapsar detalle' : 'Expandir detalle'}
                        >
                          {isExpanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                        </button>
                      </td>
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
                    {isExpanded && (
                      <tr key={`${order.id}-detail`} className="order-detail-row">
                        <td colSpan={8}>
                          <div className="grid gap-3 md:grid-cols-2">
                            <div>
                              <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-500 mb-2">Productos del pedido</p>
                              <div className="space-y-2">
                                {order.items?.map((item) => (
                                  <div key={item.id} className="order-detail-item">
                                    <div>
                                      <p className="font-bold">{item.product?.name || 'Producto'}</p>
                                      <p className="text-xs text-stone-500">{item.quantity}x {formatCurrency(item.unitPrice)}</p>
                                    </div>
                                    <p className="font-black">{formatCurrency(item.subtotal)}</p>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-3 space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-stone-600">Subtotal</span>
                                  <span className="font-bold">{formatCurrency(order.subtotal)}</span>
                                </div>
                                {order.deliveryFeeApplied > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-stone-600">Domicilio</span>
                                    <span className="font-bold">{formatCurrency(order.deliveryFeeApplied)}</span>
                                  </div>
                                )}
                                {order.discountAmount > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-stone-600">Descuento</span>
                                    <span className="font-bold text-emerald-700">-{formatCurrency(order.discountAmount)}</span>
                                  </div>
                                )}
                                <div className="flex justify-between border-t border-stone-200 pt-1">
                                  <span className="font-bold">Total</span>
                                  <span className="font-black">{formatCurrency(order.total)}</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-500 mb-2">Informacion del pedido</p>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-stone-600">Metodo de pago</span>
                                  <span className="font-bold">{statuses.find(([v]) => v === order.paymentMethod)?.[1] || order.paymentMethod}</span>
                                </div>
                                {order.couponCode && (
                                  <div className="flex justify-between">
                                    <span className="text-stone-600">Cupon</span>
                                    <span className="font-bold text-emerald-700">{order.couponCode}</span>
                                  </div>
                                )}
                                {order.deliveryZoneName && (
                                  <div className="flex justify-between">
                                    <span className="text-stone-600">Zona de entrega</span>
                                    <span className="font-bold">{order.deliveryZoneName}</span>
                                  </div>
                                )}
                                {order.scheduledFor && (
                                  <div className="flex justify-between">
                                    <span className="text-stone-600">Programado</span>
                                    <span className="font-bold">{formatDate(order.scheduledFor)}</span>
                                  </div>
                                )}
                                {order.notes && (
                                  <div>
                                    <span className="text-stone-600">Notas</span>
                                    <p className="mt-1 rounded-md bg-amber-50 p-2 text-xs">{order.notes}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={loadOrders} />
    </div>
  );
}
