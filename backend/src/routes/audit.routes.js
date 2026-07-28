import { Router } from 'express';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getAuditLogs } from '../services/audit.service.js';

export const auditRouter = Router();

auditRouter.use(authenticate, requireAdmin);

auditRouter.get('/', asyncHandler(async (req, res) => {
  const { entityType, entityId, limit, offset } = req.query;
  const result = await getAuditLogs({
    restaurantId: req.user.restaurantId,
    entityType,
    entityId,
    limit: Math.min(Number(limit) || 50, 200),
    offset: Number(offset) || 0
  });
  res.json(result);
}));
