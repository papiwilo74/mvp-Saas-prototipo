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
  EMAIL_FROM: z.string().default('FastFood SaaS <pedidos@example.com>'),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional()
});

const rawEnv = { ...process.env };
if (rawEnv.NODE_ENV === '') {
  delete rawEnv.NODE_ENV;
}

const parsedEnv = envSchema.safeParse(rawEnv);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsedEnv.error.format());
  process.exit(1);
}

const validatedEnv = parsedEnv.data;

const normalizeUrl = (value) => value?.replace(/\/+$/, '');

const frontendUrl = normalizeUrl(validatedEnv.FRONTEND_URL);
const allowedOrigins = validatedEnv.ALLOWED_ORIGINS
  ? validatedEnv.ALLOWED_ORIGINS.split(',').map((o) => normalizeUrl(o.trim())).filter(Boolean).join(',')
  : undefined;

if (validatedEnv.NODE_ENV === 'production') {
  if (frontendUrl.includes('localhost') || frontendUrl.includes('127.0.0.1')) {
    console.error('❌ FRONTEND_URL must not be localhost in production.');
    process.exit(1);
  }
  if (allowedOrigins && (allowedOrigins.includes('localhost') || allowedOrigins.includes('127.0.0.1'))) {
    console.error('❌ ALLOWED_ORIGINS must not contain localhost in production.');
    process.exit(1);
  }
  if (validatedEnv.JWT_SECRET.length < 32) {
    console.warn('⚠️  WARNING: Using a short JWT_SECRET in production. Use at least 32 chars.');
  }
  if (!validatedEnv.RESEND_API_KEY) {
    console.warn('⚠️  WARNING: RESEND_API_KEY is not set. Emails will be disabled.');
  }
  if (!validatedEnv.CLOUDINARY_CLOUD_NAME) {
    console.warn('⚠️  WARNING: Cloudinary is not configured. Image uploads will fail.');
  }
}

export const env = {
  ...validatedEnv,
  FRONTEND_URL: frontendUrl,
  ALLOWED_ORIGINS: allowedOrigins
};
