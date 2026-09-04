import { useEffect, useState, useRef } from 'react';
import { ChefHat, Clock, Printer, Volume2, VolumeX, CheckCircle, ArrowRight } from 'lucide-react';
import { io } from 'socket.io-client';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

const KITCHEN_COLUMNS = [
  { id: 'PENDING', title: 'Pendientes', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  { id: 'PREPARING', title: 'En Preparación', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  { id: 'ON_THE_WAY', title: 'Listos / En Camino', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' }
];

export function AdminKitchenPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const audioCtxRef = useRef(null);

  const playAlertSound = () => {
    if (!soundEnabled) return;
    try {
      const ctx = audioCtxRef.current || new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // Audio fallback
    }
  };

  const loadOrders = async () => {
    try {
      const { data } = await api.get('/orders/admin');
      setOrders(data.orders || []);
    } catch {
      // Error handling
    }
  };

  useEffect(() => {
    // Initial data loading is an external request triggered by the screen lifecycle.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrders();

    const socket = io(import.meta.env.VITE_API_URL || '', {
      query: { restaurantId: user?.restaurantId },
      withCredentials: true
    });

    socket.on('kitchen-order', (newOrder) => {
      playAlertSound();
      setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
    });

    socket.on('kitchen-updated', (updatedOrder) => {
      setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
    });

    return () => socket.disconnect();
  }, [user?.restaurantId, soundEnabled]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch {
      // Error handling
    }
  };

  const handlePrint = (order) => {
    setSelectedTicket(order);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-orange-600 p-2.5 text-white">
            <ChefHat size={26} />
          </div>
          <div>
            <h1 className="text-xl font-black text-stone-900">Pantalla de Cocina (KDS)</h1>
            <p className="text-xs text-stone-500">Gestión de comandas y pedidos en tiempo real</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition ${
              soundEnabled
                ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                : 'border-stone-200 bg-stone-100 text-stone-500'
            }`}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            {soundEnabled ? 'Sonido Activo' : 'Sonido Silenciado'}
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {KITCHEN_COLUMNS.map((col) => {
          const colOrders = orders.filter((o) => o.status === col.id);
          return (
            <div key={col.id} className={`rounded-xl border ${col.border} ${col.bg} p-4 flex flex-col min-h-[500px]`}>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-200/60">
                <h2 className="font-black text-stone-800 text-sm flex items-center gap-2">
                  <span>{col.title}</span>
                  <span className="rounded-full bg-stone-900 px-2 py-0.5 text-xs text-white">
                    {colOrders.length}
                  </span>
                </h2>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {colOrders.length === 0 ? (
                  <div className="text-center py-10 text-xs text-stone-400 font-medium">
                    Sin pedidos en este estado
                  </div>
                ) : (
                  colOrders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm hover:shadow-md transition space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-black text-stone-900">
                              #{order.orderNumber}
                            </span>
                            {order.paymentStatus === 'APPROVED' ? (
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800">
                                ✓ Pagado
                              </span>
                            ) : (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800">
                                ⚠️ {order.paymentMethod === 'NEQUI' ? 'Nequi sin verificar' : 'Pago pendiente'}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-stone-700">{order.customerName}</p>
                          {order.customerAddress && (
                            <p className="text-[11px] text-stone-500 truncate max-w-[200px]">
                              📍 {order.customerAddress}
                            </p>
                          )}
                        </div>
                        <StatusBadge status={order.status} />
                      </div>

                      <div className="border-t border-b border-stone-100 py-2 space-y-1">
                        {(order.items || []).map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <span className="font-bold text-stone-900">
                              {item.quantity}x {item.product?.name || 'Producto'}
                            </span>
                            <span className="text-stone-500">{formatCurrency(item.subtotal)}</span>
                          </div>
                        ))}
                      </div>

                      {order.notes && (
                        <div className="rounded bg-amber-50 p-2 text-[11px] text-amber-800 font-medium">
                          📝 {order.notes}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-stone-400 flex items-center gap-1">
                          <Clock size={13} />
                          {formatDate(order.createdAt)}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handlePrint(order)}
                            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded"
                            title="Imprimir comanda"
                          >
                            <Printer size={15} />
                          </button>

                          {col.id === 'PENDING' && (
                            <button
                              type="button"
                              onClick={() => updateStatus(order.id, 'PREPARING')}
                              className="btn-primary py-1 px-2 text-xs flex items-center gap-1"
                            >
                              Preparar <ArrowRight size={13} />
                            </button>
                          )}

                          {col.id === 'PREPARING' && (
                            <button
                              type="button"
                              onClick={() => updateStatus(order.id, 'ON_THE_WAY')}
                              className="btn-primary py-1 px-2 text-xs bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1"
                            >
                              Listo <CheckCircle size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Printable Ticket Template */}
      {selectedTicket && (
        <div className="hidden print:block print:fixed print:inset-0 print:bg-white print:p-4 text-black text-xs font-mono">
          <div className="max-w-[80mm] mx-auto text-center space-y-2">
            <h1 className="text-lg font-bold">COMANDA DE COCINA</h1>
            <p className="text-sm">Pedido #{selectedTicket.orderNumber}</p>
            <p>{formatDate(selectedTicket.createdAt)}</p>
            <div className="border-b border-dashed my-2"></div>
            <p className="text-left font-bold">Cliente: {selectedTicket.customerName}</p>
            {selectedTicket.customerPhone && <p className="text-left">Tel: {selectedTicket.customerPhone}</p>}
            {selectedTicket.customerAddress && <p className="text-left">Dir: {selectedTicket.customerAddress}</p>}
            <div className="border-b border-dashed my-2"></div>
            <div className="text-left space-y-1">
              {(selectedTicket.items || []).map((item, i) => (
                <div key={i} className="flex justify-between font-bold text-sm">
                  <span>{item.quantity}x {item.product?.name}</span>
                </div>
              ))}
            </div>
            {selectedTicket.notes && (
              <>
                <div className="border-b border-dashed my-2"></div>
                <p className="text-left font-bold">NOTAS: {selectedTicket.notes}</p>
              </>
            )}
            <div className="border-b border-dashed my-2"></div>
            <p className="font-bold text-sm">Total: {formatCurrency(selectedTicket.total)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
