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
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().nullish().or(z.literal('')).transform((v) => (v ? v.trim() : '')),
  price: z.coerce.number().positive('El precio debe ser un número positivo'),
  imageUrl: z.string().nullish().or(z.literal('')).transform((v) => (v ? v.trim() : null)),
  isAvailable: z.boolean().optional().default(true),
  trackStock: z.boolean().optional().default(false),
  stock: z.coerce.number().int().min(0).nullish(),
  isCombo: z.boolean().optional().default(false),
  comboItems: z.array(z.string().min(1)).nullish().transform((v) => (v || [])),
  variants: z.array(productVariantSchema).nullish().transform((v) => (v || null)),
  categoryId: z.string().min(1, 'La categoría es requerida')
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
