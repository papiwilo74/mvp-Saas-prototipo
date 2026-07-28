import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signToken = (user) =>
  jwt.sign(
    { sub: user.id, role: user.role, restaurantId: user.restaurantId },
    env.JWT_SECRET,
    { expiresIn: '15m' }
  );

export const verifyToken = (token) => jwt.verify(token, env.JWT_SECRET);

export const signRefreshToken = (user) =>
  jwt.sign(
    { sub: user.id, version: user.refreshTokenVersion },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
  );

export const verifyRefreshToken = (token) => jwt.verify(token, env.JWT_REFRESH_SECRET);