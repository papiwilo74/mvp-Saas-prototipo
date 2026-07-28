import { Router } from 'express';
import { createRateLimit } from '../middlewares/rateLimit.middleware.js';
import { env } from '../config/env.js';
import { healthRouter } from './health.routes.js';
import { authRouter } from './auth.routes.js';
import { categoryRouter } from './category.routes.js';
import { customerRouter } from './customer.routes.js';
import { exportRouter } from './export.routes.js';
import { menuRouter } from './menu.routes.js';
import { orderRouter } from './order.routes.js';
import { paymentRouter } from './payment.routes.js';
import { productRouter } from './product.routes.js';
import { reportRouter } from './report.routes.js';
import { restaurantConfigRouter } from './restaurantConfig.routes.js';
import { superadminRouter } from './superadmin.routes.js';
import { analyticsRouter } from './analytics.routes.js';
import { mapsRouter } from './maps.routes.js';
import { staffRouter } from './staff.routes.js';
import { onboardingRouter } from './onboarding.routes.js';
import { sitemapRouter } from './sitemap.routes.js';

export const apiRouter = Router();

const globalRateLimit = createRateLimit({
  windowMs: env.GLOBAL_RATE_LIMIT_WINDOW_MS,
  maxRequests: env.GLOBAL_RATE_LIMIT_MAX,
  keyPrefix: 'global'
});

const adminRateLimit = createRateLimit({
  windowMs: env.ADMIN_RATE_LIMIT_WINDOW_MS,
  maxRequests: env.ADMIN_RATE_LIMIT_MAX,
  keyPrefix: 'admin'
});

apiRouter.use('/health', healthRouter);
apiRouter.use('/sitemap.xml', sitemapRouter);

apiRouter.use(globalRateLimit);
apiRouter.use('/admin', adminRateLimit);
apiRouter.use('/superadmin', adminRateLimit);
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
apiRouter.use('/staff', staffRouter);
apiRouter.use('/onboarding', onboardingRouter);
