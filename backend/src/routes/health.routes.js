import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  const dbStatus = await prisma.$queryRaw`SELECT 1 as ok`.then(() => 'connected').catch(() => 'disconnected');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    db: dbStatus,
    version: '0.1.0'
  });
});
