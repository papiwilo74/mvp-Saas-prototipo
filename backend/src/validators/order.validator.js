import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    restaurantSlug: z.string().optional(),
    paymentMethod: z.enum(['CASH', 'NEQUI', 'CARD', 'WOMPI']).default('CASH'),
    couponCode: z.string().optional(),
    deliveryZoneName: z.string().optional(),
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
