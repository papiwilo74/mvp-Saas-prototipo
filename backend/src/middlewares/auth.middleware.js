import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { verifyToken } from '../utils/token.js';

export const authenticate = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
      throw new ApiError(401, 'Token requerido');
    }

    const payload = verifyToken(header.split(' ')[1]);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, role: true, restaurantId: true }
    });

    if (!user) {
      throw new ApiError(401, 'Usuario no encontrado');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error.statusCode ? error : new ApiError(401, 'Token invalido o expirado'));
  }
};

export const optionalAuthenticate = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
      return next();
    }

    const payload = verifyToken(header.split(' ')[1]);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, role: true, restaurantId: true }
    });

    req.user = user || null;
    return next();
  } catch {
    return next();
  }
};

export const requireAdmin = (req, _res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return next(new ApiError(403, 'Acceso solo para administradores'));
  }

  return next();
};
