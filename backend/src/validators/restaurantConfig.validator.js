import { z } from 'zod';

const optionalUrl = z.string().nullish().or(z.literal('')).transform((val) => (val ? val.trim() : null));
const optionalString = z.string().nullish().or(z.literal('')).transform((val) => (val ? val.trim() : null));

const deliveryZoneSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'El nombre de la zona es requerido'),
  fee: z.coerce.number().min(0).default(0),
  minOrder: z.coerce.number().min(0).nullish(),
  estimatedMinutes: z.coerce.number().int().min(0).nullish(),
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
  minimumOrder: z.coerce.number().min(0).nullish(),
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
    email: z.string().nullish().or(z.literal('')).transform((val) => (val ? val.trim() : null)),
    facebookUrl: optionalUrl,
    instagramUrl: optionalUrl,
    openingHours: optionalString,
    businessHours: z.record(z.any()).nullish().transform((val) => val || null),
    acceptsScheduledOrders: z.boolean().optional().default(false),
    leadTimeMinutes: z.coerce.number().int().min(0).optional().default(30),
    deliveryFee: z.coerce.number().min(0).optional().default(0),
    storeLatitude: z.coerce.number().min(-90).max(90).nullish(),
    storeLongitude: z.coerce.number().min(-180).max(180).nullish(),
    deliveryModes: z.array(z.enum(['DELIVERY', 'PICKUP'])).nullish().transform((val) => val || ['DELIVERY', 'PICKUP']),
    deliveryZones: z.array(deliveryZoneSchema).nullish().transform((val) => val || []),
    coupons: z.array(couponSchema).nullish().transform((val) => val || []),
    paymentMethods: z.array(z.string()).nullish().transform((val) => val || ['CASH', 'NEQUI', 'CARD']),
    wompiPublicKey: optionalString,
    wompiPrivateKey: optionalString,
    whatsappToken: optionalString,
    whatsappPhoneNumberId: optionalString,
    googleMapsApiKey: optionalString,
    loyaltyProgram: z.object({
      enabled: z.boolean().default(false),
      pointsPerPeso: z.coerce.number().min(0).optional().default(0.01),
      pointsValue: z.coerce.number().min(0).optional().default(10)
    }).passthrough().nullish()
  }).passthrough()
});
