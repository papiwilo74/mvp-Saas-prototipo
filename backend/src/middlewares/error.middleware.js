import { Prisma } from '@prisma/client';
import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';

export const notFound = (req, res, next) => {
  next(new ApiError(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (error, req, res, _next) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const statusCode = error.code === 'P2002' ? 409 : 400;
    return res.status(statusCode).json({
      message: 'Error de base de datos',
      code: error.code
    });
  }

  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    message: error.message || 'Error interno del servidor',
    details: error.details,
    stack: env.NODE_ENV === 'development' ? error.stack : undefined
  });
};

