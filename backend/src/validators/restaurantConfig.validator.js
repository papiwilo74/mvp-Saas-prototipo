import { z } from 'zod';

const optionalUrl = z.string().url().optional().or(z.literal(''));

export const updateRestaurantConfigSchema = z.object({
  body: z.object({
    restaurantName: z.string().min(2),
    logoUrl: optionalUrl,
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    address: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    facebookUrl: optionalUrl,
    instagramUrl: optionalUrl,
    openingHours: z.string().optional(),
    deliveryFee: z.coerce.number().min(0).optional(),
    paymentMethods: z.array(z.enum(['CASH', 'NEQUI', 'CARD'])).optional()
  })
});

