import { ApiError } from '../utils/apiError.js';

const buckets = new Map();

const getClientKey = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
};

const cleanupBucket = (bucket, now) => {
  bucket.timestamps = bucket.timestamps.filter((timestamp) => now - timestamp < bucket.windowMs);
};

const cleanupExpiredBuckets = () => {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    cleanupBucket(bucket, now);
    if (bucket.timestamps.length === 0) {
      buckets.delete(key);
    }
  }
};

setInterval(cleanupExpiredBuckets, 60_000);

export const createRateLimit = ({ windowMs, maxRequests, keyPrefix }) => (req, _res, next) => {
  const now = Date.now();
  const bucketKey = `${keyPrefix}:${getClientKey(req)}`;
  const bucket = buckets.get(bucketKey) || { timestamps: [], windowMs };
  bucket.windowMs = windowMs;
  cleanupBucket(bucket, now);

  if (bucket.timestamps.length >= maxRequests) {
    return next(new ApiError(429, 'Demasiadas solicitudes. Intenta de nuevo en unos minutos.'));
  }

  bucket.timestamps.push(now);
  buckets.set(bucketKey, bucket);
  return next();
};
