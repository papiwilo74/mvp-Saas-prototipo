import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const getClientKey = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
};

export const createRateLimit = ({ windowMs, maxRequests, keyPrefix, message }) => rateLimit({
  windowMs,
  max: maxRequests,
  keyGenerator: (req) => `${keyPrefix}:${getClientKey(req)}`,
  handler: (_req, res) => {
    res.status(429).json({
      message: message || 'Demasiadas solicitudes. Intenta de nuevo en unos minutos.'
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});