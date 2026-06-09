import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signToken = (user) =>
  jwt.sign(
    { sub: user.id, role: user.role, restaurantId: user.restaurantId },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

export const verifyToken = (token) => jwt.verify(token, env.JWT_SECRET);

