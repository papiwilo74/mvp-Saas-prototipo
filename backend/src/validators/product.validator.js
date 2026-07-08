import { z } from 'zod';

const variantOptionSchema = z.object({
  name: z.string().min(1),
  priceAdjustment: z.coerce.number().default(0)
});

const productVariantSchema = z.object({
  name: z.string().min(1),
  options: z.array(variantOptionSchema).min(1),
  required: z.boolean().optional()
});

const productBody = z.object({
  name: z.string().min(2),
  description: z.string().min(5),
  price: z.coerce.number().positive(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  isAvailable: z.boolean().optional(),
  trackStock: z.boolean().optional(),
  stock: z.coerce.number().int().min(0).optional().nullable(),
  isCombo: z.boolean().optional(),
  comboItems: z.array(z.string().min(1)).optional(),
  variants: z.array(productVariantSchema).optional(),
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

export const listProductsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20)
  }).optional()
});
