import Redis from 'ioredis';
import { env } from './env.js';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  lazyConnect: true
});

redisConnection.on('error', (err) => {
  if (process.env.NODE_ENV !== 'test') {
    console.warn('[Redis] Connection warning:', err.message);
  }
});
