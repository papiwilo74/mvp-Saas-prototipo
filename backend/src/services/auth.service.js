import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { DEFAULT_RESTAURANT_SLUG } from '../config/constants.js';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { signToken, signRefreshToken, verifyRefreshToken } from '../utils/token.js';
import { env } from '../config/env.js';
import { sendWelcomeEmail } from './email.service.js';
import { logger } from './logger.service.js';

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  restaurantId: user.restaurantId
});

export const register = async ({ name, email, password }) => {
  const restaurant = await prisma.restaurant.findFirst({ where: { slug: DEFAULT_RESTAURANT_SLUG } });
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

  return { user: publicUser(user), token: signToken(user), refreshToken: signRefreshToken(user) };
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

  return { user: publicUser(user), token: signToken(user), refreshToken: signRefreshToken(user) };
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