import { prisma } from '../config/prisma.js';

export const createAuditLog = async ({ userId, action, entityType, entityId, changes, ipAddress, restaurantId }) => {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
      changes: changes ?? undefined,
      ipAddress,
      restaurantId
    }
  });
};

export const getAuditLogs = async ({ restaurantId, entityType, entityId, limit = 50, offset = 0 }) => {
  const where = {};
  if (restaurantId) where.restaurantId = restaurantId;
  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    }),
    prisma.auditLog.count({ where })
  ]);

  return { logs, total };
};
