import { prisma } from '../config/prisma.js';

const paymentLabels = { CASH: 'Efectivo', NEQUI: 'Nequi', CARD: 'Tarjeta' };
const statusLabels = { PENDING: 'Pendiente', PREPARING: 'Preparando', ON_THE_WAY: 'En camino', DELIVERED: 'Entregado', CANCELLED: 'Cancelado' };

const csvEscape = (value) => {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) return `"${str.replace(/"/g, '""')}"`;
  return str;
};

export const exportOrdersCSV = async (restaurantId, filters = {}) => {
  const where = { restaurantId };
  if (filters.status) where.status = filters.status;
  if (filters.from || filters.to) {
    where.createdAt = {};
    if (filters.from) where.createdAt.gte = new Date(filters.from);
    if (filters.to) {
      const end = new Date(filters.to);
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  const orders = await prisma.order.findMany({
    where,
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
    take: 5000
  });

  const header = [
    'Numero', 'Fecha', 'Cliente', 'Telefono', 'Direccion', 'Email',
    'Zona', 'Metodo Pago', 'Cupon', 'Descuento', 'Domicilio',
    'Subtotal', 'Total', 'Estado', 'Programado', 'Notas', 'Productos'
  ];

  const rows = orders.map((order) => [
    order.orderNumber,
    order.createdAt.toISOString(),
    order.customerName,
    order.customerPhone || '',
    order.customerAddress || '',
    order.customerEmail || '',
    order.deliveryZoneName || '',
    paymentLabels[order.paymentMethod] || order.paymentMethod,
    order.couponCode || '',
    Number(order.discountAmount),
    Number(order.deliveryFeeApplied),
    Number(order.subtotal),
    Number(order.total),
    statusLabels[order.status] || order.status,
    order.scheduledFor?.toISOString() || '',
    order.notes || '',
    (order.items || []).map((item) => `${item.quantity}x ${item.product?.name || '?'}`).join('; ')
  ]);

  return [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
};
