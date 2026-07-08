import { ArrowRight, CheckCircle2, Clock3, CookingPot, MapPinned, MessageSquare, ShoppingBag, Star, Ticket } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
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
  const pointsEarned = state?.pointsEarned || 0;
  const { config } = useRestaurantConfig();
  const whatsappUrl = state?.whatsappUrl || buildWhatsAppOrderUrl({ order, config });
  const scheduledText = order?.scheduledFor ? formatDate(order.scheduledFor) : '';
  const currentStep = statusSteps.findIndex((s) => s.status === order?.status) || 0;

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
                <div className="mt-3 flex justify-between gap-3">
                  <span className="text-stone-600">Pago</span>
                  <span className="font-black">{paymentLabels[order.paymentMethod] || 'Simulado'}</span>
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
