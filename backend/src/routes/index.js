import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { categoryRouter } from './category.routes.js';
import { customerRouter } from './customer.routes.js';
import { menuRouter } from './menu.routes.js';
import { orderRouter } from './order.routes.js';
import { productRouter } from './product.routes.js';
import { restaurantConfigRouter } from './restaurantConfig.routes.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => res.json({ status: 'ok' }));
apiRouter.use('/auth', authRouter);
apiRouter.use('/menu', menuRouter);
apiRouter.use('/categories', categoryRouter);
apiRouter.use('/customers', customerRouter);
apiRouter.use('/products', productRouter);
apiRouter.use('/orders', orderRouter);
apiRouter.use('/restaurant-config', restaurantConfigRouter);
