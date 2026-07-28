import { createAuditLog } from '../services/audit.service.js';

export const audit = ({ action, entityType, entityId, changes }) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = function (body) {
      const entityIdValue = typeof entityId === 'function' ? entityId(req, body) : entityId;
      const changesValue = typeof changes === 'function' ? changes(req, body) : changes;

      createAuditLog({
        userId: req.user?.id,
        action,
        entityType,
        entityId: entityIdValue ?? req.params?.id,
        changes: changesValue,
        ipAddress: req.ip || req.connection?.remoteAddress,
        restaurantId: req.user?.restaurantId
      }).catch(() => {});

      return originalJson(body);
    };

    next();
  };
};
