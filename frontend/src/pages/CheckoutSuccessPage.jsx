import { CheckCircle2, Clock3, MapPinned, MessageSquare, ShoppingBag, Ticket } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useRestaurantConfig } from '../context/RestaurantConfigContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { buildWhatsAppOrderUrl, paymentLabels } from '../utils/whatsappOrder';

export function CheckoutSuccessPage() {
  const { state } = useLocation();
  const order = state?.order;
  const { config } = useRestaurantConfig();
  const whatsappUrl = state?.whatsappUrl || buildWhatsAppOrderUrl({ order, config });
  const scheduledText = order?.scheduledFor ? formatDate(order.scheduledFor) : '';

  return (
    <div className="container-page py-8">
      <div className="glass-panel mx-auto max-w-2xl p-6 text-center sm:p-8">
        <span className="badge-chip text-emerald-700">Pedido confirmado</span>
        <CheckCircle2 className="mx-auto mt-5 text-emerald-600" size={60} />
        <h1 className="mt-4 text-3xl font-black tracking-tight">Pedido creado con éxito</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-stone-600">
          Guardamos tu pedido en la plataforma. Si WhatsApp no se abrió automáticamente, toca el botón para enviarlo al restaurante y dejarlo listo para producción.
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
                {order.couponCode ? (
                  <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                    <Ticket size={16} />
                    Cupón aplicado: {order.couponCode}
                  </div>
                ) : null}
              </div>
              <div className="safe-panel p-5 text-left text-sm">
                <div className="flex items-start gap-3">
                  <ShoppingBag className="mt-0.5 text-[color:var(--color-primary)]" size={18} />
                  <div>
                    <p className="font-black">Pedido guardado en sistema</p>
                    <p className="mt-1 text-stone-600">Ahora puedes compartirlo por WhatsApp con el restaurante y continuar la compra si deseas.</p>
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
              </div>
            </div>
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
              >
                <MessageSquare size={18} />
                Enviar pedido por WhatsApp
              </a>
            )}
          </>
        ) : null}
        <div className="mt-6">
          <Link to="/menu" className="btn-primary w-full">Seguir comprando</Link>
        </div>
      </div>
    </div>
  );
}
