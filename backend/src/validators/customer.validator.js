import { z } from 'zod';

export const listCustomersSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20)
  }).optional()
});

export const customerIdSchema = z.object({
  params: z.object({ id: z.string().min(1) })
});

export const updateCustomerNotesSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({ notes: z.string().max(1000).optional().default('') })
});