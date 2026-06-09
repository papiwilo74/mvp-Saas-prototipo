import { Resend } from 'resend';
import { env } from '../config/env.js';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export const sendOrderConfirmationEmail = async ({ to, order }) => {
  if (!resend || !to) return;

  await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject: `Pedido #${order.orderNumber} recibido`,
    html: `
      <h1>Gracias por tu pedido</h1>
      <p>Recibimos tu pedido #${order.orderNumber} por un total de $${order.total}.</p>
      <p>Estado actual: ${order.status}</p>
    `
  });
};

export const sendWelcomeEmail = async ({ to, name }) => {
  if (!resend || !to) return;

  await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject: 'Bienvenido a pedidos online',
    html: `
      <h1>Hola ${name}</h1>
      <p>Tu cuenta esta lista para pedir facil y rapido desde el celular.</p>
    `
  });
};

export const sendOrderStatusEmail = async ({ to, order }) => {
  if (!resend || !to) return;

  await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject: `Actualizacion del pedido #${order.orderNumber}`,
    html: `
      <h1>Tu pedido cambio de estado</h1>
      <p>Pedido #${order.orderNumber}</p>
      <p>Estado actual: ${order.status}</p>
    `
  });
};
