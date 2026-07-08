import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { authRouter } from './auth.routes.js';
import { categoryRouter } from './category.routes.js';
import { customerRouter } from './customer.routes.js';
import { exportRouter } from './export.routes.js';
import { menuRouter } from './menu.routes.js';
import { orderRouter } from './order.routes.js';
import { paymentRouter } from './payment.routes.js';
import { productRouter } from './product.routes.js';
import { reportRouter } from './report.routes.js';
import { superadminRouter } from './superadmin.routes.js';
import { analyticsRouter } from './analytics.routes.js';
import { mapsRouter } from './maps.routes.js';

export const apiRouter = Router();

apiRouter.get('/health', async (_req, res) => {
  let database = 'ok';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    database = 'error';
  }
  res.status(database === 'ok' ? 200 : 503).json({ status: database === 'ok' ? 'ok' : 'degraded', database });
});
apiRouter.use('/auth', authRouter);
apiRouter.use('/menu', menuRouter);
apiRouter.use('/categories', categoryRouter);
apiRouter.use('/customers', customerRouter);
apiRouter.use('/products', productRouter);
apiRouter.use('/orders', orderRouter);
apiRouter.use('/restaurant-config', restaurantConfigRouter);
apiRouter.use('/reports', reportRouter);
apiRouter.use('/export', exportRouter);
apiRouter.use('/payments', paymentRouter);
apiRouter.use('/superadmin', superadminRouter);
apiRouter.use('/analytics', analyticsRouter);
apiRouter.use('/maps', mapsRouter);
