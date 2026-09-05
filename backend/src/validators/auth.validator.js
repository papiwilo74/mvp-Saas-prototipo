import { z } from 'zod';

const strongPassword = z.string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(128, 'La contraseña es demasiado larga')
  .regex(/[A-Z]/, 'La contraseña debe incluir al menos una mayúscula')
  .regex(/[a-z]/, 'La contraseña debe incluir al menos una minúscula')
  .regex(/[0-9]/, 'La contraseña debe incluir al menos un número')
  .regex(/[^A-Za-z0-9]/, 'La contraseña debe incluir al menos un símbolo');

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'El nombre es demasiado largo'),
    email: z.string().trim().email('Correo electrónico inválido').max(255),
    password: strongPassword,
    storeSlug: z.string().trim().max(100).optional(),
    restaurantSlug: z.string().trim().max(100).optional()
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Correo electrónico inválido'),
    password: z.string().min(1, 'La contraseña es requerida')
  })
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Correo electrónico inválido')
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Correo electrónico inválido'),
    token: z.string().trim().min(1, 'El token es requerido'),
    password: strongPassword
  })
});

export const registerRestaurantSchema = z.object({
  body: z.object({
    restaurantName: z.string().trim().min(2, 'El nombre del restaurante debe tener al menos 2 caracteres').max(100),
    slug: z.string().trim().min(2, 'El identificador debe tener al menos 2 caracteres').max(50).regex(/^[a-z0-9-]+$/, 'El enlace solo puede contener letras minúsculas, números y guiones (-)'),
    phone: z.string().trim().min(7, 'El teléfono es requerido').max(30),
    adminName: z.string().trim().min(2, 'Tu nombre debe tener al menos 2 caracteres').max(100),
    email: z.string().trim().email('Correo electrónico inválido').max(255),
    password: strongPassword
  })
});
