import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { DEFAULT_RESTAURANT_SLUG } from '../config/constants.js';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { signToken, signRefreshToken, verifyRefreshToken } from '../utils/token.js';
import { env } from '../config/env.js';
import { sendWelcomeEmail, sendEmailVerificationEmail } from './email.service.js';
import { logger } from './logger.service.js';

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  restaurantId: user.restaurantId
});

const createVerification = async (user, update) => {
  const code = String(crypto.randomInt(100000, 1000000));
  await update({
    emailVerificationCodeHash: crypto.createHash('sha256').update(code).digest('hex'),
    emailVerificationExpires: new Date(Date.now() + 10 * 60 * 1000),
    emailVerificationAttempts: 0
  });
  await sendEmailVerificationEmail({ to: user.email, name: user.name, code });
};

export const register = async ({ name, email, password, storeSlug, restaurantSlug }) => {
  const slugToSearch = storeSlug || restaurantSlug || DEFAULT_RESTAURANT_SLUG;
  const restaurant = await prisma.restaurant.findFirst({ where: { slug: slugToSearch } });
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      restaurantId: restaurant?.id
    }
  });

  sendWelcomeEmail({ to: user.email, name: user.name }).catch((err) => {
    logger.warn({ err, email: user.email }, 'Welcome email failed to send');
  });

  await createVerification(user, (data) => prisma.user.update({ where: { id: user.id }, data }));
  return { user: publicUser(user), verificationRequired: true };
};

export const forgotPassword = async ({ email }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { message: 'Si el correo existe, recibiras instrucciones.' };

  const token = crypto.randomBytes(32).toString('hex');
  const resetToken = crypto.createHash('sha256').update(token).digest('hex');
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordResetToken: resetToken, passwordResetExpires: resetExpires }
  });

  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}&email=${email}`;

  try {
    const { sendPasswordResetEmail } = await import('./email.service.js');
    await sendPasswordResetEmail({ to: email, name: user.name, resetUrl });
  } catch {
    // Email sending is optional
  }

  return { message: 'Si el correo existe, recibiras instrucciones.' };
};

export const resetPassword = async ({ email, token, password }) => {
  const resetToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await prisma.user.findUnique({
    where: { email, passwordResetToken: resetToken, passwordResetExpires: { gte: new Date() } }
  });

  if (!user) throw new ApiError(400, 'Token invalido o expirado');

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null
    }
  });

  return { message: 'Contrasena actualizada exitosamente.' };
};

export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    logger.warn({ email }, 'Failed login attempt: user not found');
    throw new ApiError(401, 'Credenciales invalidas');
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    logger.warn({ email }, 'Failed login attempt: wrong password');
    throw new ApiError(401, 'Credenciales invalidas');
  }

  if (!user.emailVerifiedAt) throw new ApiError(403, 'Debes confirmar tu correo antes de iniciar sesión');

  return { user: publicUser(user), token: signToken(user), refreshToken: signRefreshToken(user) };
};

export const verifyEmail = async ({ email, code }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.emailVerifiedAt) return { message: 'Correo confirmado correctamente' };
  if (user.emailVerificationAttempts >= 5) throw new ApiError(429, 'Demasiados intentos. Solicita un nuevo código.');
  if (!user.emailVerificationExpires || user.emailVerificationExpires < new Date()) throw new ApiError(400, 'El código expiró. Solicita uno nuevo.');
  const hash = crypto.createHash('sha256').update(code).digest('hex');
  if (hash !== user.emailVerificationCodeHash) {
    await prisma.user.update({ where: { id: user.id }, data: { emailVerificationAttempts: { increment: 1 } } });
    throw new ApiError(400, 'Código incorrecto');
  }
  await prisma.user.update({ where: { id: user.id }, data: { emailVerifiedAt: new Date(), emailVerificationCodeHash: null, emailVerificationExpires: null, emailVerificationAttempts: 0 } });
  return { message: 'Correo confirmado correctamente' };
};

export const refresh = async (refreshToken) => {
  if (!refreshToken) throw new ApiError(401, 'Refresh token requerido');

  const decoded = verifyRefreshToken(refreshToken);
  const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
  if (!user) throw new ApiError(401, 'Usuario no encontrado');

  if (decoded.version !== user.refreshTokenVersion) {
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenVersion: { increment: 1 } }
    });
    throw new ApiError(401, 'Refresh token invalido o reutilizado');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenVersion: { increment: 1 } }
  });

  const updatedUser = { ...user, refreshTokenVersion: user.refreshTokenVersion + 1 };

  return { user: publicUser(updatedUser), token: signToken(updatedUser), refreshToken: signRefreshToken(updatedUser) };
};

export const revokeRefreshTokens = async (userId) => {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshTokenVersion: { increment: 1 } }
  });
};

export const registerRestaurant = async ({ restaurantName, slug, phone, adminName, email, password }) => {
  const existingRestaurant = await prisma.restaurant.findUnique({ where: { slug } });
  if (existingRestaurant) {
    throw new ApiError(409, 'El enlace (slug) ya está en uso por otro restaurante. Elige otro.');
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new ApiError(409, 'Ya existe una cuenta registrada con este correo.');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await prisma.$transaction(async (tx) => {
    const restaurant = await tx.restaurant.create({
      data: {
        name: restaurantName,
        slug,
        phone,
        email
      }
    });

    await tx.restaurantConfig.create({
      data: {
        restaurantId: restaurant.id,
        restaurantName,
        phone,
        whatsapp: phone,
        primaryColor: '#ea580c',
        secondaryColor: '#141414',
        paymentMethods: ['CASH', 'NEQUI'],
        deliveryModes: ['DELIVERY', 'PICKUP']
      }
    });

    await tx.orderCounter.create({
      data: {
        restaurantId: restaurant.id,
        lastOrderNumber: 0
      }
    });

    const user = await tx.user.create({
      data: {
        name: adminName,
        email,
        passwordHash,
        role: 'ADMIN',
        restaurantId: restaurant.id
      }
    });

    return { restaurant, user };
  });

  await createVerification(result.user, (data) => prisma.user.update({ where: { id: result.user.id }, data }));
  return {
    user: publicUser(result.user),
    restaurant: { id: result.restaurant.id, name: result.restaurant.name, slug: result.restaurant.slug },
    verificationRequired: true
  };
};
