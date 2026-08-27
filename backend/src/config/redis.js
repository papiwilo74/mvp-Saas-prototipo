import Redis from 'ioredis';
import { env } from './env.js';

const redisUrl = process.env.REDIS_URL;
const redisConfigured = Boolean(redisUrl);

export const redisConnection = new Redis(redisUrl || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  lazyConnect: true,
  retryStrategy: redisConfigured ? undefined : () => null
});

let warningShown = false;
redisConnection.on('error', (err) => {
  if (process.env.NODE_ENV !== 'test' && !warningShown) {
    warningShown = true;
    console.warn('[Redis] Connection warning:', err.message);
  }
});

if (!redisConfigured && process.env.NODE_ENV === 'production') {
  console.warn('[Redis] REDIS_URL no está configurada; las colas de correo están desactivadas.');
}
