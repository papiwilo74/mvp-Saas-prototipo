import { z } from 'zod';

const productBody = z.object({
  name: z.string().min(2),
  description: z.string().min(5),
  price: z.coerce.number().positive(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  isAvailable: z.boolean().optional(),
  categoryId: z.string().min(1)
});

export const createProductSchema = z.object({ body: productBody });

export const updateProductSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: productBody.partial()
});

export const productIdSchema = z.object({
  params: z.object({ id: z.string().min(1) })
});

