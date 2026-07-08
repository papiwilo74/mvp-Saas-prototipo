import { Resend } from 'resend';
import { env } from '../config/env.js';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

const buildOrderItemsHtml = (order) => {
  if (!order.items?.length) return '<p>Sin productos</p>';
  return order.items
    .map(
      (item) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${item.quantity}x ${item.product?.name || 'Producto'}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right">$${(item.subtotal || 0).toLocaleString('es-CO')}</td>
    </tr>`
    )
    .join('');
};

const buildOrderSummaryHtml = (order) => {
  const rows = [];
  rows.push(`<tr><td style="padding:4px 0;color:#6b7280">Subtotal</td><td style="padding:4px 0;text-align:right;font-weight:700">$${(order.subtotal || 0).toLocaleString('es-CO')}</td></tr>`);
  if (Number(order.deliveryFeeApplied) > 0) {
    rows.push(`<tr><td style="padding:4px 0;color:#6b7280">Domicilio</td><td style="padding:4px 0;text-align:right;font-weight:700">$${Number(order.deliveryFeeApplied).toLocaleString('es-CO')}</td></tr>`);
  }
  if (Number(order.discountAmount) > 0) {
    rows.push(`<tr><td style="padding:4px 0;color:#10b981">Descuento${order.couponCode ? ` (${order.couponCode})` : ''}</td><td style="padding:4px 0;text-align:right;font-weight:700;color:#10b981">-$${Number(order.discountAmount).toLocaleString('es-CO')}</td></tr>`);
  }
  rows.push(`<tr><td style="padding:8px 0;font-weight:800;border-top:2px solid #1f2937" colspan="2"><span style="float:left">Total</span><span style="float:right">$${(order.total || 0).toLocaleString('es-CO')}</span></td></tr>`);
  return rows.join('');
};

const buildOrderTemplate = ({ order, title, intro }) => {
  const paymentLabels = { CASH: 'Efectivo', NEQUI: 'Nequi', CARD: 'Tarjeta' };

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f1e8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:560px;margin:20px auto;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06)">
    <div style="padding:32px 28px 20px;background:linear-gradient(135deg,#ea580c,#f97316);color:#fff">
      <h1 style="margin:0;font-size:22px;font-weight:800">${title}</h1>
      <p style="margin:8px 0 0;opacity:0.9;font-size:14px">${intro}</p>
    </div>
    <div style="padding:24px 28px">
      <p style="margin:0 0 16px;font-size:15px;color:#374151">Pedido <strong>#${order.orderNumber}</strong> · ${new Date(order.createdAt).toLocaleDateString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })}</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
        <thead>
          <tr style="background:#f9fafb">
            <th style="padding:8px 12px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280">Producto</th>
            <th style="padding:8px 12px;text-align:right;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280">Subtotal</th>
          </tr>
        </thead>
        <tbody>${buildOrderItemsHtml(order)}</tbody>
      </table>
      <table style="width:100%;font-size:14px;margin-bottom:16px">${buildOrderSummaryHtml(order)}</table>
      <div style="background:#f9fafb;border-radius:12px;padding:14px 16px;font-size:13px;color:#6b7280;margin-bottom:16px">
        ${order.customerName ? `<p style="margin:0 0 4px"><strong>Cliente:</strong> ${order.customerName}</p>` : ''}
        ${order.customerPhone ? `<p style="margin:0 0 4px"><strong>Telefono:</strong> ${order.customerPhone}</p>` : ''}
        ${order.customerAddress ? `<p style="margin:0 0 4px"><strong>Direccion:</strong> ${order.customerAddress}</p>` : ''}
        ${order.deliveryZoneName ? `<p style="margin:0 0 4px"><strong>Zona:</strong> ${order.deliveryZoneName}</p>` : ''}
        <p style="margin:0"><strong>Pago:</strong> ${paymentLabels[order.paymentMethod] || 'Simulado'}</p>
        ${order.scheduledFor ? `<p style="margin:4px 0 0"><strong>Programado:</strong> ${new Date(order.scheduledFor).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })}</p>` : ''}
        ${order.notes ? `<p style="margin:8px 0 0;padding:8px;background:#fffbeb;border-radius:8px;color:#92400e">${order.notes}</p>` : ''}
      </div>
      <p style="margin:0;font-size:13px;color:#9ca3af">Estado actual: <strong style="color:#374151">${order.status}</strong></p>
    </div>
    <div style="padding:16px 28px;background:#f9fafb;font-size:12px;color:#9ca3af;text-align:center">
      Este correo fue generado automaticamente por la plataforma de pedidos.
    </div>
  </div>
</body>
</html>`;
};

export const sendOrderConfirmationEmail = async ({ to, order }) => {
  if (!resend || !to) return;

  try {
    await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject: `Pedido #${order.orderNumber} recibido - Gracias por tu compra`,
      html: buildOrderTemplate({
        order,
        title: 'Pedido recibido',
        intro: `Tu pedido #${order.orderNumber} fue registrado exitosamente.`
      })
    });
  } catch (error) {
    console.error('Error al enviar correo de confirmacion de pedido:', error);
  }
};

export const sendWelcomeEmail = async ({ to, name }) => {
  if (!resend || !to) return;

  try {
    await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject: 'Bienvenido a pedidos online',
      html: `
        <div style="max-width:480px;margin:20px auto;background:#fff;border-radius:24px;padding:32px;font-family:sans-serif;text-align:center">
          <h1 style="font-size:24px">Hola ${name}</h1>
          <p style="color:#6b7280">Tu cuenta esta lista para pedir facil y rapido desde el celular.</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Error al enviar correo de bienvenida:', error);
  }
};

export const sendOrderStatusEmail = async ({ to, order }) => {
  if (!resend || !to) return;

  const statusLabels = {
    PENDING: 'Pendiente',
    PREPARING: 'Preparando tu pedido',
    ON_THE_WAY: 'En camino',
    DELIVERED: 'Entregado',
    CANCELLED: 'Cancelado'
  };

  try {
    await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject: `Pedido #${order.orderNumber} - ${statusLabels[order.status] || order.status}`,
      html: buildOrderTemplate({
        order,
        title: 'Actualizacion de pedido',
        intro: `Tu pedido #${order.orderNumber} ahora esta: ${statusLabels[order.status] || order.status}.`
      })
    });
  } catch (error) {
    console.error('Error al enviar correo de estado del pedido:', error);
  }
};
