import { CheckCircle2, MessageSquare } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useRestaurantConfig } from '../context/RestaurantConfigContext';
import { formatCurrency } from '../utils/formatters';

const paymentLabels = {
  CASH: 'Efectivo',
  NEQUI: 'Nequi',
  CARD: 'Tarjeta'
};

export function CheckoutSuccessPage() {
  const { state } = useLocation();
  const order = state?.order;
  const { config } = useRestaurantConfig();

  const whatsappNumber = config?.whatsapp || '';
  const restaurantName = config?.restaurantName || 'Demo Burger';
  const cleanPhone = whatsappNumber.replace(/\D/g, '');

  let whatsappUrl = '';
  if (order && cleanPhone) {
    const itemsText = order.items
      ? order.items
          .map((item) => `• ${item.quantity}x ${item.product.name} → ${formatCurrency(item.subtotal)}`)
          .join('\n')
      : '';

    const message = `*Nuevo Pedido #${order.orderNumber} - ${restaurantName}*

- *Cliente:* ${order.customerName || ''}
- *Teléfono:* ${order.customerPhone || ''}
${order.customerAddress ? `- *Dirección:* ${order.customerAddress}` : ''}

- *Productos:*
${itemsText}

- *Total:* ${formatCurrency(order.total)}
- *Pago:* ${paymentLabels[order.paymentMethod] || 'Simulado'}
${order.notes ? `- *Notas:* ${order.notes}` : ''}

_Pedido realizado desde la app web_`;

    whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  }

  return (
    <div className="container-page py-8">
      <div className="safe-panel p-6 text-center max-w-md mx-auto">
        <CheckCircle2 className="mx-auto text-emerald-600" size={54} />
        <h1 className="mt-4 text-2xl font-black">Pedido confirmado</h1>
        <p className="mx-auto mt-2 text-sm leading-6 text-stone-600">
          Tu pedido quedó en estado Pendiente. Por favor, envía el detalle del pedido a nuestro WhatsApp para coordinar la entrega.
        </p>
        {order ? (
          <>
            <div className="mt-5 rounded-md bg-stone-100 p-4 text-left text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-stone-600">Pedido</span>
                <span className="font-black">#{order.orderNumber}</span>
              </div>
              <div className="mt-2 flex justify-between gap-3">
                <span className="text-stone-600">Total</span>
                <span className="font-black">{formatCurrency(order.total)}</span>
              </div>
              <div className="mt-2 flex justify-between gap-3">
                <span className="text-stone-600">Pago</span>
                <span className="font-black">{paymentLabels[order.paymentMethod] || 'Simulado'}</span>
              </div>
            </div>
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 bg-emerald-500 w-full mt-4 shadow-sm"
              >
                <MessageSquare size={18} />
                Enviar pedido por WhatsApp
              </a>
            )}
          </>
        ) : null}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link to="/orders" className="btn-secondary">Ver historial</Link>
          <Link to="/menu" className="btn-primary">Seguir comprando</Link>
        </div>
      </div>
    </div>
  );
}
