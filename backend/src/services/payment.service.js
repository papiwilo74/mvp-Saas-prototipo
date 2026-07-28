import crypto from 'crypto';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';

const WOMPI_API = env.WOMPI_ENV === 'prod'
  ? 'https://api.wompi.co/v1'
  : 'https://sandbox.wompi.co/v1';

const getWompiKeys = async (restaurantId) => {
  if (!restaurantId) return { publicKey: env.WOMPI_PUBLIC_KEY, privateKey: env.WOMPI_PRIVATE_KEY };
  const config = await prisma.restaurantConfig.findUnique({ where: { restaurantId } });
  return {
    publicKey: config?.wompiPublicKey || env.WOMPI_PUBLIC_KEY,
    privateKey: config?.wompiPrivateKey || env.WOMPI_PRIVATE_KEY
  };
};

export const verifyWompiSignature = (rawBody, signature) => {
  const secret = env.WOMPI_EVENTS_SECRET;
  if (!secret) return true;
  if (!signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
};

export const createPaymentLink = async ({ amountInCents, reference, restaurantId, customerEmail: _customerEmail }) => {
  const keys = await getWompiKeys(restaurantId);
  if (!keys.privateKey) throw new Error('WOMPI_PRIVATE_KEY no configurada');

  const response = await fetch(`${WOMPI_API}/payment_links`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${keys.privateKey}`
    },
    body: JSON.stringify({
      name: reference,
      description: `Pedido ${reference}`,
      single_use: true,
      collect_shipping: false,
      currency: 'COP',
      amount_in_cents: amountInCents,
      redirect_url: `${env.FRONTEND_URL}/checkout/success`,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || 'Error al crear link de pago Wompi');
  }

  const paymentData = await response.json();
  const link = paymentData.data;

  await prisma.paymentTransaction.create({
    data: {
      wompiId: link.id,
      status: 'PENDING',
      amountInCents,
      currency: 'COP',
      reference
    }
  });

  return { paymentUrl: link.single_use_url || link.url, wompiId: link.id };
};

export const verifyWompiTransaction = async (wompiId) => {
  const existing = await prisma.paymentTransaction.findUnique({ where: { wompiId } });
  if (!existing) return null;

  const response = await fetch(`${WOMPI_API}/transactions/${wompiId}`);
  if (!response.ok) return existing;

  const data = await response.json();
  const { status } = data.data;

  const mappedStatus = status === 'APPROVED' ? 'APPROVED'
    : status === 'DECLINED' ? 'DECLINED'
    : status === 'VOIDED' ? 'DECLINED'
    : 'PENDING';

  if (mappedStatus !== existing.status) {
    await prisma.paymentTransaction.update({
      where: { wompiId },
      data: { status: mappedStatus }
    });
  }

  return { ...existing, status: mappedStatus };
};

export const processWompiWebhook = async (body, signature) => {
  if (!verifyWompiSignature(body, signature)) {
    throw new Error('Firma de webhook Wompi invalida');
  }

  const data = typeof body === 'string' ? JSON.parse(body) : body;
  if (!data?.data?.transaction?.id) return null;

  const { id, status, reference, amount_in_cents } = data.data.transaction;

  const mappedStatus = status === 'APPROVED' ? 'APPROVED'
    : status === 'DECLINED' ? 'DECLINED'
    : 'PENDING';

  let transaction = await prisma.paymentTransaction.findUnique({ where: { wompiId: id } });

  if (transaction) {
    transaction = await prisma.paymentTransaction.update({
      where: { wompiId: id },
      data: { status: mappedStatus }
    });
  } else {
    transaction = await prisma.paymentTransaction.create({
      data: {
        wompiId: id,
        status: mappedStatus,
        amountInCents: amount_in_cents || 0,
        currency: 'COP',
        reference: reference || id
      }
    });
  }

  return transaction;
};
