import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(24),
  JWT_EXPIRES_IN: z.string().default('7d'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  ALLOWED_ORIGINS: z.string().optional(),
  LOGIN_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  LOGIN_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  PUBLIC_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  PUBLIC_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(60),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('FastFood SaaS <pedidos@example.com>')
});

const rawEnv = { ...process.env };
if (rawEnv.NODE_ENV === '') {
  delete rawEnv.NODE_ENV;
}

const parsedEnv = envSchema.parse(rawEnv);

const normalizeUrl = (value) => value?.replace(/\/+$/, '');

export const env = {
  ...parsedEnv,
  FRONTEND_URL: normalizeUrl(parsedEnv.FRONTEND_URL),
  ALLOWED_ORIGINS: parsedEnv.ALLOWED_ORIGINS
    ? parsedEnv.ALLOWED_ORIGINS.split(',').map((origin) => normalizeUrl(origin.trim())).filter(Boolean).join(',')
    : undefined
};
