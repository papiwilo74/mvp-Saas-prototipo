import pino from 'pino';
import { env } from '../config/env.js';

const isDev = env.NODE_ENV !== 'production';

export const logger = pino({
  level: env.NODE_ENV === 'test' ? 'silent' : (isDev ? 'debug' : 'info'),
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' }
      }
    : undefined,
  serializers: {
    req: (req) => ({ method: req.method, url: req.url, ip: req.ip }),
    res: (res) => ({ statusCode: res.statusCode }),
    err: pino.stdSerializers.err
  }
});
