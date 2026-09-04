import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'El nombre es demasiado largo'),
    email: z.string().trim().email('Correo electrónico inválido').max(255),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(128, 'La contraseña es demasiado larga'),
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
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(128)
  })
});

export const registerRestaurantSchema = z.object({
  body: z.object({
    restaurantName: z.string().trim().min(2, 'El nombre del restaurante debe tener al menos 2 caracteres').max(100),
    slug: z.string().trim().min(2, 'El identificador debe tener al menos 2 caracteres').max(50).regex(/^[a-z0-9-]+$/, 'El enlace solo puede contener letras minúsculas, números y guiones (-)'),
    phone: z.string().trim().min(7, 'El teléfono es requerido').max(30),
    adminName: z.string().trim().min(2, 'Tu nombre debe tener al menos 2 caracteres').max(100),
    email: z.string().trim().email('Correo electrónico inválido').max(255),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(128)
  })
});
