import { z } from 'zod';

export const createStaffSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  email: z.string().email('Email invalido'),
  phone: z.string().optional(),
  pin: z.string().length(4, 'El PIN debe tener 4 digitos'),
  role: z.enum(['ADMIN', 'CASHIER', 'KITCHEN', 'DELIVERY']).default('CASHIER')
});

export const updateStaffSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  pin: z.string().length(4).optional(),
  role: z.enum(['ADMIN', 'CASHIER', 'KITCHEN', 'DELIVERY']).optional(),
  isActive: z.boolean().optional()
});