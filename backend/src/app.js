import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middlewares/error.middleware.js';
import { createRateLimit } from './middlewares/rateLimit.middleware.js';
import { apiRouter } from './routes/index.js';

export const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedOrigins = [
  env.FRONTEND_URL,
  ...(env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean) : [])
];

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Bloqueado por CORS'));
    },
    credentials: true
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

app.use(
  '/api/auth/login',
  createRateLimit({
    windowMs: env.LOGIN_RATE_LIMIT_WINDOW_MS,
    maxRequests: env.LOGIN_RATE_LIMIT_MAX,
    keyPrefix: 'login'
  })
);

app.use(
  ['/api/orders', '/api/menu', '/api/restaurant-config'],
  createRateLimit({
    windowMs: env.PUBLIC_RATE_LIMIT_WINDOW_MS,
    maxRequests: env.PUBLIC_RATE_LIMIT_MAX,
    keyPrefix: 'public'
  })
);

app.use('/api', apiRouter);
app.use(notFound);
app.use(errorHandler);