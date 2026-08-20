import { ArrowRight, CheckCircle2, Clock3, CookingPot, MapPinned, MessageSquare, ShoppingBag, Star, Ticket } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { env } from '../config/env';
import { useRestaurantConfig } from '../context/RestaurantConfigContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { buildWhatsAppOrderUrl, paymentLabels } from '../utils/whatsappOrder';

const statusSteps = [
  { status: 'PENDING', label: 'Recibido', icon: CheckCircle2, color: 'text-emerald-600' },
  { status: 'PREPARING', label: 'Preparando', icon: CookingPot, color: 'text-blue-600' },
  { status: 'ON_THE_WAY', label: 'En camino', icon: ShoppingBag, color: 'text-purple-600' },
  { status: 'DELIVERED', label: 'Entregado', icon: CheckCircle2, color: 'text-emerald-600' }
];

export function CheckoutSuccessPage() {
  const { state } = useLocation();
  const order = state?.order;
  const [currentStatus, setCurrentStatus] = useState(order?.status || 'PENDING');
  const pointsEarned = state?.pointsEarned || 0;
  const { config } = useRestaurantConfig();
  const whatsappUrl = state?.whatsappUrl || buildWhatsAppOrderUrl({ order, config });
  const scheduledText = order?.scheduledFor ? formatDate(order.scheduledFor) : '';
  const currentStep = statusSteps.findIndex((s) => s.status === currentStatus);

  useEffect(() => {
    if (!order?.id) return;
    const socket = io(env.apiUrl?.replace('/api', '') || 'http://localhost:4000', {
      query: { restaurantId: config.id || '' }
    });
    socket.on('order-status-changed', (updated) => {
      if (updated.id === order.id) setCurrentStatus(updated.status);
    });
    return () => { socket.disconnect(); };
  }, [order?.id, config.id]);

  return (
    <div className="container-page py-8">
      <div className="glass-panel mx-auto max-w-2xl p-6 text-center sm:p-8">
        <span className="badge-chip text-emerald-700">Pedido confirmado</span>
        <CheckCircle2 className="mx-auto mt-5 text-emerald-600" size={60} />
        <h1 className="mt-4 text-3xl font-black tracking-tight">Pedido enviado al restaurante</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-stone-600">
          Tu pedido fue registrado en el sistema y el restaurante ya lo recibio en su panel.{pointsEarned > 0 ? ` Ganaste ${pointsEarned} puntos por esta compra.` : ''}
        </p>
        {order ? (
          <>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="safe-panel p-5 text-left text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-stone-600">Pedido</span>
                  <span className="font-black">#{order.orderNumber}</span>
                </div>
                <div className="mt-3 flex justify-between gap-3">
                  <span className="text-stone-600">Total</span>
                  <span className="font-black">{formatCurrency(order.total)}</span>
                </div>
                <div className="mt-3 flex justify-between items-center gap-3">
                  <span className="text-stone-600">Pago</span>
                  <div className="flex items-center gap-2">
                    <span className="font-black">{paymentLabels[order.paymentMethod] || 'Simulado'}</span>
                    {order.paymentMethod === 'NEQUI' && (
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-bold text-purple-700">
                        Transferencia / QR
                      </span>
                    )}
                    {order.paymentMethod === 'CASH' && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                        Contra entrega
                      </span>
                    )}
                  </div>
                </div>
                {order.deliveryFeeApplied > 0 ? (
                  <div className="mt-3 flex justify-between gap-3">
                    <span className="text-stone-600">Domicilio</span>
                    <span className="font-black">{formatCurrency(order.deliveryFeeApplied)}</span>
                  </div>
                ) : null}
                {order.couponCode ? (
                  <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                    <Ticket size={16} />
                    Cupon aplicado: {order.couponCode}
                  </div>
                ) : null}
              </div>
              <div className="safe-panel p-5 text-left text-sm">
                <div className="flex items-start gap-3">
                  <ShoppingBag className="mt-0.5 text-emerald-600" size={18} />
                  <div>
                    <p className="font-black">El restaurante ya tiene tu pedido</p>
                    <p className="mt-1 text-stone-600">Recibiras actualizaciones del estado en tu correo.</p>
                  </div>
                </div>
                {order.deliveryZoneName ? (
                  <div className="mt-4 flex items-start gap-3">
                    <MapPinned className="mt-0.5 text-[color:var(--color-primary)]" size={18} />
                    <div>
                      <p className="font-black">Zona de entrega</p>
                      <p className="mt-1 text-stone-600">{order.deliveryZoneName}</p>
                    </div>
                  </div>
                ) : null}
                {scheduledText ? (
                  <div className="mt-4 flex items-start gap-3">
                    <Clock3 className="mt-0.5 text-[color:var(--color-primary)]" size={18} />
                    <div>
                      <p className="font-black">Pedido programado</p>
                      <p className="mt-1 text-stone-600">{scheduledText}</p>
                    </div>
                  </div>
                ) : null}
                {pointsEarned > 0 ? (
                  <div className="mt-4 flex items-start gap-3">
                    <Star className="mt-0.5 text-amber-500" size={18} />
                    <div>
                      <p className="font-black">+{pointsEarned} puntos ganados</p>
                      <p className="mt-1 text-stone-600">Sigue acumulando para tu proximo descuento.</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Tarjeta destacada de instrucciones si el pago es NEQUI */}
            {order.paymentMethod === 'NEQUI' && (
              <div className="mt-6 rounded-3xl border-2 border-purple-300 bg-purple-50/90 p-5 sm:p-6 text-left shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-purple-600 text-white font-black text-lg shadow-sm">
                    N
                  </div>
                  <div>
                    <h3 className="text-base font-black text-purple-950">Paga con Nequi / Llave Bre-B o QR</h3>
                    <p className="text-xs text-purple-700">Monto total a transferir: <strong className="text-purple-950 text-sm">{formatCurrency(order.total)}</strong></p>
                  </div>
                </div>

                {/* Mostrar QR si el restaurante lo subio */}
                {config?.nequiQrUrl && (
                  <div className="mt-4 flex flex-col items-center justify-center rounded-2xl bg-white p-4 border border-purple-200 text-center">
                    <span className="text-[11px] font-black uppercase tracking-wider text-purple-900 mb-2">Escanea el código QR de Nequi</span>
                    <img src={config.nequiQrUrl} alt="QR Nequi" className="h-44 w-44 rounded-xl object-contain border border-purple-100 shadow-sm" />
                    <span className="mt-2 text-xs text-stone-500">Abre tu app de Nequi y escanea este código</span>
                  </div>
                )}

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {/* Número de Nequi */}
                  <div className="rounded-2xl bg-white p-3.5 border border-purple-200 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Número de Nequi:</span>
                      <p className="text-base font-black text-stone-900">{config?.nequiNumber || config?.phone || config?.whatsapp || 'Consultar'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const num = (config?.nequiNumber || config?.phone || config?.whatsapp || '').replace(/\s+/g, '');
                        if (num) navigator.clipboard?.writeText(num);
                      }}
                      className="mt-2 inline-flex items-center justify-center rounded-lg bg-purple-100 hover:bg-purple-200 px-3 py-1.5 text-xs font-black text-purple-800 transition-colors"
                    >
                      Copiar número
                    </button>
                  </div>

                  {/* Llave Bre-B si existe */}
                  {config?.nequiBreB ? (
                    <div className="rounded-2xl bg-white p-3.5 border border-purple-200 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Llave Bre-B:</span>
                        <p className="text-base font-black text-purple-900">{config.nequiBreB}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (config.nequiBreB) navigator.clipboard?.writeText(config.nequiBreB.trim());
                        }}
                        className="mt-2 inline-flex items-center justify-center rounded-lg bg-purple-100 hover:bg-purple-200 px-3 py-1.5 text-xs font-black text-purple-800 transition-colors"
                      >
                        Copiar llave Bre-B
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-white p-3.5 border border-purple-200 flex items-center gap-2 text-xs text-purple-800">
                      <span>✓ Transferencia inmediata sin comisión desde cualquier cuenta Nequi o Bancolombia.</span>
                    </div>
                  )}
                </div>

                {/* Boton para enviar comprobante por WhatsApp */}
                <div className="mt-4 rounded-2xl bg-purple-950 p-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black">¿Ya realizaste la transferencia?</p>
                    <p className="text-[11px] text-purple-200">Envía el comprobante para que la cocina inicie tu pedido al instante.</p>
                  </div>
                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-4 py-2 text-xs font-black text-white shadow-sm transition-all shrink-0"
                    >
                      <MessageSquare size={15} />
                      Enviar Comprobante
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-400 mb-3">Estado del pedido en tiempo real</p>
              <div className="flex items-center justify-center gap-1">
                {statusSteps.map((step, i) => {
                  const isActive = i <= currentStep;
                  const isCurrent = i === currentStep;
                  const Icon = step.icon;
                  return (
                    <div key={i} className="flex items-center">
                      <div className={`flex flex-col items-center ${isActive ? '' : 'opacity-30'}`}>
                        <div className={`grid h-10 w-10 place-items-center rounded-full ${isActive ? 'bg-stone-950 text-white' : 'bg-stone-200 text-stone-500'}`}>
                          <Icon size={16} />
                        </div>
                        <span className="mt-1 text-xs font-bold">{step.label}</span>
                      </div>
                      {i < statusSteps.length - 1 && (
                        <div className={`mx-1 h-0.5 w-8 rounded ${isActive && !isCurrent ? 'bg-stone-950' : 'bg-stone-200'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {whatsappUrl && (
              <div className="mt-5 border-t border-stone-200 pt-4">
                <p className="text-xs text-stone-400 mb-2">Opcion secundaria</p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-stone-800"
                >
                  <MessageSquare size={14} />
                  Tambien puedes enviar el pedido por WhatsApp
                </a>
              </div>
            )}
          </>
        ) : null}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link to="/menu" className="btn-primary flex-1">
            Seguir comprando
            <ArrowRight size={18} />
          </Link>
          <Link to="/" className="btn-secondary flex-1">Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}
