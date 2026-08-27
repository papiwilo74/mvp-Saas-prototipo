import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { verifyToken } from '../utils/token.js';
import { logger } from '../services/logger.service.js';

const extractToken = (req) => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.split(' ')[1];
  return req.cookies?.ff_token || null;
};

export const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      throw new ApiError(401, 'Token requerido para esta acción');
    }

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, role: true, restaurantId: true }
    });

    if (!user) {
      throw new ApiError(401, 'El usuario asociado al token no fue encontrado en el sistema');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error.statusCode ? error : new ApiError(401, 'Sesión inválida o expirada. Por favor ingresa nuevamente'));
  }
};

export const optionalAuthenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) return next();

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, role: true, restaurantId: true }
    });

    req.user = user || null;
    return next();
  } catch (error) {
    // Si el JWT expira, simplemente permitimos seguir como usuario anónimo
    if (error instanceof ApiError || error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      req.user = null;
      return next();
    }
    // Si hay un error real de base de datos no lo "silenciamos". Lo pasamos al errorHandler (previene falsos negativos).
    logger.error({ err: error, path: req.originalUrl }, 'Fallo de acceso a base de datos en optionalAuthenticate');
    return next(error);
  }
};

export const requireAdmin = (req, _res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Autenticación requerida para acceder'));
  }
  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
    return next(new ApiError(403, 'Acceso restringido: Permisos de administrador requeridos'));
  }

  return next();
};

export const requireSuperAdmin = (req, _res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Autenticación requerida para acceder'));
  }
  if (req.user.role !== 'SUPERADMIN') {
    return next(new ApiError(403, 'Acceso restringido: Permisos de super administrador requeridos'));
  }

  return next();
};
