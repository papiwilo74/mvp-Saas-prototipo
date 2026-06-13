import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    restaurantSlug: z.string().optional(),
    paymentMethod: z.enum(['CASH', 'NEQUI', 'CARD']).default('CASH'),
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

export const updateOrderStatusSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    status: z.enum(['PENDING', 'PREPARING', 'ON_THE_WAY', 'DELIVERED', 'CANCELLED'])
  })
});
