import { z } from 'zod';

const optionalUrl = z.string().url().optional().or(z.literal(''));
const deliveryZoneSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  fee: z.coerce.number().min(0),
  minOrder: z.coerce.number().min(0).optional().nullable(),
  estimatedMinutes: z.coerce.number().int().min(0).optional().nullable(),
  isActive: z.boolean().optional()
});
const couponSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(3),
  description: z.string().optional().or(z.literal('')),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountValue: z.coerce.number().positive(),
  minimumOrder: z.coerce.number().min(0).optional().nullable(),
  startsAt: z.string().optional().or(z.literal('')),
  endsAt: z.string().optional().or(z.literal('')),
  isActive: z.boolean().optional()
});

export const updateRestaurantConfigSchema = z.object({
  body: z.object({
    restaurantName: z.string().min(2),
    logoUrl: optionalUrl,
    heroImageUrl: optionalUrl,
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    address: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    facebookUrl: optionalUrl,
    instagramUrl: optionalUrl,
    openingHours: z.string().optional(),
    businessHours: z.object({
      monday: z.tuple([z.string(), z.string()]).optional(),
      tuesday: z.tuple([z.string(), z.string()]).optional(),
      wednesday: z.tuple([z.string(), z.string()]).optional(),
      thursday: z.tuple([z.string(), z.string()]).optional(),
      friday: z.tuple([z.string(), z.string()]).optional(),
      saturday: z.tuple([z.string(), z.string()]).optional(),
      sunday: z.tuple([z.string(), z.string()]).optional()
    }).optional(),
    acceptsScheduledOrders: z.boolean().optional(),
    leadTimeMinutes: z.coerce.number().int().min(0).optional(),
    deliveryFee: z.coerce.number().min(0).optional(),
    deliveryZones: z.array(deliveryZoneSchema).optional(),
    coupons: z.array(couponSchema).optional(),
    paymentMethods: z.array(z.enum(['CASH', 'NEQUI', 'CARD', 'WOMPI'])).optional(),
    wompiPublicKey: z.string().optional().or(z.literal('')),
    wompiPrivateKey: z.string().optional().or(z.literal('')),
    whatsappToken: z.string().optional().or(z.literal('')),
    whatsappPhoneNumberId: z.string().optional().or(z.literal('')),
    googleMapsApiKey: z.string().optional().or(z.literal('')),
    loyaltyProgram: z.object({
      enabled: z.boolean(),
      pointsPerPeso: z.coerce.number().min(0).optional(),
      pointsValue: z.coerce.number().min(0).optional()
    }).optional()
  })
});

