import { prisma } from '../config/prisma.js';

const WHATSAPP_API = 'https://graph.facebook.com/v21.0';

const getWhatsAppConfig = async (restaurantId) => {
  const config = await prisma.restaurantConfig.findUnique({
    where: { restaurantId },
    select: { whatsappToken: true, whatsappPhoneNumberId: true }
  });
  return {
    token: config?.whatsappToken,
    phoneNumberId: config?.whatsappPhoneNumberId
  };
};

export const sendStatusUpdate = async (restaurantId, phone, orderNumber, status) => {
  const config = await getWhatsAppConfig(restaurantId);
  if (!config.token || !config.phoneNumberId || !phone) return;

  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length < 10) return;

  const statusMessages = {
    PREPARING: `Tu pedido #${orderNumber} ya esta en preparacion. Te avisamos cuando este listo.`,
    ON_THE_WAY: `Tu pedido #${orderNumber} va en camino. Llega pronto.`,
    DELIVERED: `Tu pedido #${orderNumber} fue entregado. Gracias por tu compra.`
  };

  const message = statusMessages[status];
  if (!message) return;

  try {
    await fetch(`${WHATSAPP_API}/${config.phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'text',
        text: { body: message }
      })
    });
  } catch (error) {
    console.error('Error al enviar mensaje de WhatsApp:', error);
  }
};
