import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';

export const requireTenantAccess = (modelName) => {
  return async (req, _res, next) => {
    const id = req.params.id;
    if (!id) return next();
    if (!req.user?.restaurantId) return next(new ApiError(403, 'Acceso denegado'));

    try {
      const record = await prisma[modelName].findUnique({
        where: { id },
        select: { restaurantId: true }
      });

      if (!record) return next(new ApiError(404, 'Registro no encontrado'));
      if (record.restaurantId !== req.user.restaurantId) {
        return next(new ApiError(403, 'No tienes acceso a este recurso'));
      }
    } catch {
      return next(new ApiError(500, 'Error al verificar acceso'));
    }

    next();
  };
};
