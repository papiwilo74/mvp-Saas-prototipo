import { z } from 'zod';

const optionalUrl = z.string().url().optional().nullable().or(z.literal(''));
const optionalString = z.string().optional().nullable();

const deliveryZoneSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'El nombre de la zona es requerido'),
  fee: z.coerce.number().min(0).default(0),
  minOrder: z.coerce.number().min(0).optional().nullable(),
  estimatedMinutes: z.coerce.number().int().min(0).optional().nullable(),
  isActive: z.boolean().optional().default(true),
  coordinates: z.any().optional(),
  polygon: z.any().optional()
}).passthrough();

const couponSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(1, 'El código de cupón es requerido'),
  description: optionalString,
  discountType: z.enum(['PERCENTAGE', 'FIXED']).default('PERCENTAGE'),
  discountValue: z.coerce.number().min(0).default(0),
  minimumOrder: z.coerce.number().min(0).optional().nullable(),
  startsAt: optionalString,
  endsAt: optionalString,
  isActive: z.boolean().optional().default(true)
}).passthrough();

export const updateRestaurantConfigSchema = z.object({
  body: z.object({
    restaurantName: z.string().min(1, 'El nombre del restaurante es requerido'),
    logoUrl: optionalUrl,
    heroImageUrl: optionalUrl,
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#ea580c'),
    secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#18181b'),
    phone: optionalString,
    whatsapp: optionalString,
    address: optionalString,
    email: z.string().email().optional().nullable().or(z.literal('')),
    facebookUrl: optionalUrl,
    instagramUrl: optionalUrl,
    openingHours: optionalString,
    businessHours: z.record(z.any()).optional().nullable(),
    acceptsScheduledOrders: z.boolean().optional().default(false),
    leadTimeMinutes: z.coerce.number().int().min(0).optional().default(30),
    deliveryFee: z.coerce.number().min(0).optional().default(0),
    deliveryZones: z.array(deliveryZoneSchema).optional().default([]),
    coupons: z.array(couponSchema).optional().default([]),
    paymentMethods: z.array(z.string()).optional().default(['CASH', 'NEQUI', 'CARD']),
    wompiPublicKey: optionalString,
    wompiPrivateKey: optionalString,
    whatsappToken: optionalString,
    whatsappPhoneNumberId: optionalString,
    googleMapsApiKey: optionalString,
    loyaltyProgram: z.object({
      enabled: z.boolean().default(false),
      pointsPerPeso: z.coerce.number().min(0).optional().default(0.01),
      pointsValue: z.coerce.number().min(0).optional().default(10)
    }).passthrough().optional().nullable()
  }).passthrough()
});
