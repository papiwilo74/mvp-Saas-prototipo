import { Prisma } from '@prisma/client';
import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';
import { ErrorCodes } from '../shared/errors.js';

const statusToErrorCode = {
  400: ErrorCodes.VALIDATION_ERROR,
  401: ErrorCodes.UNAUTHORIZED,
  403: ErrorCodes.FORBIDDEN,
  404: ErrorCodes.NOT_FOUND,
  409: ErrorCodes.CONFLICT,
  429: ErrorCodes.RATE_LIMITED,
  503: ErrorCodes.SERVICE_UNAVAILABLE,
};

export const notFound = (req, res, next) => {
  next(new ApiError(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (error, req, res, _next) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const statusCode = error.code === 'P2002' ? 409 : 400;
    return res.status(statusCode).json({
      message: 'Error de base de datos',
      code: error.code,
      errorCode: statusToErrorCode[statusCode] || ErrorCodes.INTERNAL_ERROR
    });
  }

  const statusCode = error.statusCode || 500;
  const errorCode = error.errorCode || statusToErrorCode[statusCode] || ErrorCodes.INTERNAL_ERROR;

  return res.status(statusCode).json({
    message: error.message || 'Error interno del servidor',
    errorCode,
    details: error.details,
    stack: env.NODE_ENV === 'development' ? error.stack : undefined
  });
};

