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
        .map((item) => {
          const variantInfo = item.product?._variantLabels?.length
            ? ` (${item.product._variantLabels.join(', ')})`
            : '';
          return `- ${item.quantity}x ${item.product.name}${variantInfo} - ${formatCurrency(item.subtotal)}`;
        })
        .join('\n')
    : '';

  const lines = [
    `*Nuevo Pedido #${order.orderNumber} - ${restaurantName}*`,
    '',
    `*Cliente:* ${order.customerName || ''}`,
    `*Telefono:* ${order.customerPhone || ''}`
  ];

  if (order.customerAddress) lines.push(`*Direccion:* ${order.customerAddress}`);
  if (order.customerEmail) lines.push(`*Email:* ${order.customerEmail}`);

  lines.push('', '*Productos:*', itemsText, '');

  if (order.deliveryZoneName) lines.push(`*Zona de entrega:* ${order.deliveryZoneName}`);
  if (order.deliveryFeeApplied > 0) lines.push(`*Costo de domicilio:* ${formatCurrency(order.deliveryFeeApplied)}`);
  if (order.couponCode) lines.push(`*Cupon:* ${order.couponCode} (descuento: ${formatCurrency(order.discountAmount)})`);

  lines.push(`*Total:* ${formatCurrency(order.total)}`);
  lines.push(`*Pago:* ${paymentLabels[order.paymentMethod] || 'Simulado'}`);

  if (order.scheduledFor) {
    const date = new Date(order.scheduledFor);
    lines.push(`*Programado para:* ${date.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })}`);
  }

  if (order.notes) lines.push(`*Notas:* ${order.notes}`);

  lines.push('', 'Pedido realizado desde la app web.');

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(lines.join('\n'))}`;
}

export { paymentLabels };
