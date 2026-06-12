import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middlewares/error.middleware.js';
import { apiRouter } from './routes/index.js';

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origen (como Postman, apps móviles o curl)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        env.FRONTEND_URL,
        'http://localhost:5173',
        'http://localhost:3000'
      ];

      const isAllowed = allowedOrigins.includes(origin) || 
                        origin.endsWith('.vercel.app') ||
                        origin.startsWith('http://localhost:');

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Bloqueado por CORS'));
      }
    },
    credentials: true
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use('/api', apiRouter);
app.use(notFound);
app.use(errorHandler);

