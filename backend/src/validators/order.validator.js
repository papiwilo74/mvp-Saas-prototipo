import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    restaurantSlug: z.string().optional(),
    paymentMethod: z.enum(['CASH', 'NEQUI', 'CARD', 'WOMPI']).default('CASH'),
    couponCode: z.string().optional(),
    deliveryZoneName: z.string().optional(),
    fulfillmentMode: z.enum(['DELIVERY', 'PICKUP']).default('DELIVERY'),
    customerLatitude: z.coerce.number().min(-90).max(90).optional(),
    customerLongitude: z.coerce.number().min(-180).max(180).optional(),
    scheduledFor: z.string().datetime().optional(),
    pointsRedeemed: z.coerce.number().int().min(0).optional(),
    wompiTransactionId: z.string().optional(),
    tableNumber: z.coerce.number().int().min(1).optional(),
    customer: z.object({
      name: z.string().min(2),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      address: z.string().optional()
    }),
    notes: z.string().optional(),
    items: z.array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().positive()
      })
    ).min(1)
  })
});

export const listAdminOrdersSchema = z.object({
  query: z.object({
    status: z.enum(['PENDING', 'PREPARING', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED']).optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20)
  }).optional()
});

export const updateOrderStatusSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    status: z.enum(['PENDING', 'PREPARING', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED'])
  })
});

export const updatePaymentStatusSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    paymentStatus: z.enum(['PENDING', 'APPROVED', 'DECLINED', 'ERROR'])
  })
});
