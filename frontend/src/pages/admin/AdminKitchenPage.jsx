import { Bell, Check, Clock3, Flame, MapPinned, Timer } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { api } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

const playKitchenSound = () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const context = new AudioContext();
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(440, context.currentTime);
  osc.frequency.setValueAtTime(660, context.currentTime + 0.1);
  osc.frequency.setValueAtTime(880, context.currentTime + 0.2);
  gain.gain.setValueAtTime(0.001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.15, context.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.5);
  osc.connect(gain);
  gain.connect(context.destination);
  osc.start();
  osc.stop(context.currentTime + 0.55);
};

const statusLabels = {
  PENDING: 'Pendiente',
  PREPARING: 'Preparando',
  ON_THE_WAY: 'Entregando',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado'
};

const statusColor = {
  PENDING: 'border-l-amber-400 bg-amber-50',
  PREPARING: 'border-l-blue-400 bg-blue-50',
  ON_THE_WAY: 'border-l-purple-400 bg-purple-50',
  DELIVERED: 'border-l-emerald-400 bg-emerald-50'
};

export function AdminKitchenPage() {
  const [orders, setOrders] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  const loadKitchen = useCallback(() => {
    api.get('/orders/kitchen').then(({ data }) => {
      const newOrders = data.orders;
      const prevIds = new Set(orders.map((o) => o.id));
      const hasNew = newOrders.some((o) => !prevIds.has(o.id));

      if (hasNew && soundEnabled) playKitchenSound();
      if (hasNew && notificationEnabled && Notification.permission === 'granted') {
        const newOrder = newOrders.find((o) => !prevIds.has(o.id));
        if (newOrder) {
          new Notification(`Nuevo pedido #${newOrder.orderNumber}`, {
            body: `${newOrder.customerName} - ${newOrder.items?.length || 0} productos`,
            icon: '/icons/icon-192.png'
          });
        }
      }

      setOrders(newOrders);
    });
  }, [soundEnabled, notificationEnabled, orders]);

  useEffect(() => {
    loadKitchen();
    const interval = setInterval(loadKitchen, 10000);
    return () => clearInterval(interval);
  }, [loadKitchen]);

  const updateStatus = async (orderId, status) => {
    await api.patch(`/orders/${orderId}/status`, { status });
    loadKitchen();
  };

  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const preparingCount = orders.filter((o) => o.status === 'PREPARING').length;

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-black">Pantalla de cocina</h1>
          <p className="mt-1 text-sm text-stone-600">
            {pendingCount + preparingCount} pedidos activos
            {pendingCount > 0 && ` · ${pendingCount} pendientes`}
            {preparingCount > 0 && ` · ${preparingCount} en preparacion`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className={`btn-secondary min-h-10 ${soundEnabled ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : ''}`}
            onClick={() => setSoundEnabled((v) => !v)}
          >
            <Bell size={17} />
            {soundEnabled ? 'Sonido' : 'Silenciar'}
          </button>
          <button
            type="button"
            className="btn-secondary min-h-10"
            onClick={() => {
              if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission().then(() => setNotificationEnabled(true));
              } else {
                setNotificationEnabled((v) => !v);
              }
            }}
          >
            <Flame size={17} />
            {notificationEnabled ? 'Notif.' : 'Notificar'}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {['PENDING', 'PREPARING'].map((status) => {
          const statusOrders = orders.filter((o) => o.status === status);
          return (
            <div key={status} className="overflow-hidden rounded-xl border border-stone-200 bg-white">
              <div className={`flex items-center justify-between px-5 py-4 ${status === 'PENDING' ? 'bg-amber-100' : 'bg-blue-100'}`}>
                <h2 className="text-lg font-black">
                  {status === 'PENDING' ? 'Pendientes' : 'En preparacion'}
                  <span className="ml-2 text-sm font-bold text-stone-600">({statusOrders.length})</span>
                </h2>
                <span className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">
                  {status === 'PENDING' ? 'Nuevos' : 'En proceso'}
                </span>
              </div>
              <div className="divide-y divide-stone-100 p-4">
                {statusOrders.length === 0 && (
                  <p className="py-6 text-center text-sm text-stone-500">
                    {status === 'PENDING' ? 'Sin pedidos pendientes' : 'Sin pedidos en preparacion'}
                  </p>
                )}
                {statusOrders.map((order) => (
                  <div key={order.id} className={`rounded-lg border-l-4 p-4 mb-3 last:mb-0 ${statusColor[status]}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-black">#{order.orderNumber}</span>
                          {order.tableNumber && (
                            <span className="badge-chip bg-stone-950 text-white border-0">
                              Mesa {order.tableNumber}
                            </span>
                          )}
                          {order.scheduledFor && (
                            <span className="badge-chip">
                              <Clock3 size={12} />
                              {formatDate(order.scheduledFor)}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 font-bold">{order.customerName}</p>
                        {order.notes && (
                          <p className="mt-1 rounded bg-white/80 px-2 py-1 text-xs text-stone-600">{order.notes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-stone-500">
                          <Timer size={12} className="inline mr-1" />
                          {order.scheduledFor ? 'Programado' : formatDate(order.createdAt)}
                        </p>
                        {order.deliveryZoneName && (
                          <p className="mt-1 flex items-center justify-end gap-1 text-xs text-stone-500">
                            <MapPinned size={12} />
                            {order.deliveryZoneName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      {order.items?.map((item) => (
                        <div key={item.id} className="flex items-center justify-between rounded bg-white/80 px-3 py-2 text-sm">
                          <div className="flex items-center gap-2">
                            {item.product?.imageUrl && (
                              <img src={item.product.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                            )}
                            <div>
                              <p className="font-bold">{item.product?.name || 'Producto'}</p>
                              <p className="text-xs text-stone-500">{item.quantity}x</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex gap-2">
                      {status === 'PENDING' && (
                        <button
                          type="button"
                          onClick={() => updateStatus(order.id, 'PREPARING')}
                          className="btn-primary flex-1 bg-blue-600"
                        >
                          <Check size={16} />
                          Preparar
                        </button>
                      )}
                      {status === 'PREPARING' && (
                        <button
                          type="button"
                          onClick={() => updateStatus(order.id, 'ON_THE_WAY')}
                          className="btn-primary flex-1 bg-purple-600"
                        >
                          <Check size={16} />
                          Listo para entregar
                        </button>
                      )}
                      {status === 'PREPARING' && (
                        <button
                          type="button"
                          onClick={() => updateStatus(order.id, 'PENDING')}
                          className="btn-secondary"
                        >
                          Devolver
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 text-center text-xs text-stone-400">
        Esta pantalla se actualiza automaticamente cada 10 segundos.
      </div>
    </div>
  );
}
