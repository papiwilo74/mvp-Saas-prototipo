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
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('FastFood SaaS <pedidos@example.com>')
});

export const env = envSchema.parse(process.env);

