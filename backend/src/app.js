import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import * as Sentry from '@sentry/node';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middlewares/error.middleware.js';
import { createRateLimit } from './middlewares/rateLimit.middleware.js';
import { setCsrfToken } from './middlewares/csrf.middleware.js';
import { requestLogger } from './services/logger.service.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import { apiRouter } from './routes/index.js';

Sentry.init({
  dsn: env.SENTRY_DSN,
  environment: env.NODE_ENV,
  enabled: !!env.SENTRY_DSN,
  tracesSampleRate: env.NODE_ENV === 'production' ? 0.2 : 0.0,
});

export const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedOrigins = [
  env.FRONTEND_URL,
  ...(env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean) : [])
];

app.use(compression());

const isDev = env.NODE_ENV !== 'production';
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: [
          "'self'",
          env.FRONTEND_URL,
          ...(env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean) : []),
          'https://*.wompi.co',
          'https://maps.googleapis.com',
          'https://*.mapbox.com',
          'https://api.mapbox.com'
        ].filter(Boolean),
        styleSrc: ["'self'", 'https://fonts.googleapis.com', 'https://api.mapbox.com', ...(isDev ? ["'unsafe-inline'"] : [])],
        scriptSrc: ["'self'", 'https://checkout.wompi.co', 'https://maps.googleapis.com', 'https://api.mapbox.com', ...(isDev ? ["'unsafe-inline'"] : [])],
        imgSrc: ["'self'", 'data:', 'blob:', 'https://*.googleapis.com', 'https://*.gstatic.com', 'https://*.wompi.co', 'https://*.mapbox.com', 'https://api.mapbox.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        frameSrc: ["'self'", 'https://checkout.wompi.co'],
        workerSrc: ["'self'", 'blob:'],
        childSrc: ["'self'", 'blob:'],
        objectSrc: ["'none'"],
      }
    }
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

app.use(express.json({ limit: '1mb', verify: (req, _res, buf) => { req.rawBody = buf.toString(); } }));
app.use(cookieParser());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(requestLogger());
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

app.use(setCsrfToken);

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

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customCss: '.swagger-ui .topbar { display: none }', customSiteTitle: 'FastFood SaaS API Docs' }));
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));
app.use('/api', apiRouter);
app.use(notFound);
Sentry.setupExpressErrorHandler(app);
app.use(errorHandler);
