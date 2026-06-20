import { formatCurrency } from './formatters';

const paymentLabels = {
  CASH: 'Efectivo',
  NEQUI: 'Nequi',
  CARD: 'Tarjeta'
};

export function buildWhatsAppOrderUrl({ order, config }) {
  const cleanPhone = (config?.whatsapp || config?.phone || '').replace(/\D/g, '');

  if (!order || !cleanPhone) return '';

  const restaurantName = config?.restaurantName || 'Restaurante';
  const itemsText = order.items
    ? order.items
        .map((item) => `- ${item.quantity}x ${item.product.name} - ${formatCurrency(item.subtotal)}`)
        .join('\n')
    : '';

  const message = `*Nuevo Pedido #${order.orderNumber} - ${restaurantName}*

*Cliente:* ${order.customerName || ''}
*Telefono:* ${order.customerPhone || ''}
${order.customerAddress ? `*Direccion:* ${order.customerAddress}\n` : ''}
*Productos:*
${itemsText}

*Total:* ${formatCurrency(order.total)}
*Pago:* ${paymentLabels[order.paymentMethod] || 'Simulado'}
${order.notes ? `*Notas:* ${order.notes}\n` : ''}
Pedido realizado desde la app web.`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export { paymentLabels };
