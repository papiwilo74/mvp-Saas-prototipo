import { Prisma } from '@prisma/client';
import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';
import { ErrorCodes } from '../shared/errors.js';
import { logger } from '../services/logger.service.js';

const statusToErrorCode = {
  400: ErrorCodes?.VALIDATION_ERROR || 'VALIDATION_ERROR',
  401: ErrorCodes?.UNAUTHORIZED || 'UNAUTHORIZED',
  403: ErrorCodes?.FORBIDDEN || 'FORBIDDEN',
  404: ErrorCodes?.NOT_FOUND || 'NOT_FOUND',
  409: ErrorCodes?.CONFLICT || 'CONFLICT',
  429: ErrorCodes?.RATE_LIMITED || 'RATE_LIMITED',
  503: ErrorCodes?.SERVICE_UNAVAILABLE || 'SERVICE_UNAVAILABLE',
};

export const notFound = (req, res, next) => {
  next(new ApiError(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (error, req, res, _next) => {
  // Defensa contra JSON alterado o corrupto enviado por bots buscando romper el parser
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    logger.warn({ ip: req.ip, path: req.originalUrl }, 'Payload de JSON mal formado recibido');
    return res.status(400).json({
      success: false,
      message: 'El formato de los datos enviados es inválido.',
      errorCode: statusToErrorCode[400],
      requestId: req.id
    });
  }

  const isPrismaKnown = error instanceof Prisma.PrismaClientKnownRequestError;
  const statusCode = error.statusCode || (isPrismaKnown && error.code === 'P2002' ? 409 : isPrismaKnown ? 400 : 500);
  
  if (statusCode >= 500) {
    logger.error({
      err: error,
      requestId: req.id,
      path: req.originalUrl,
      method: req.method,
      userId: req.user?.id
    }, 'Error interno no manejado en la aplicación');
  } else if (statusCode >= 400) {
    logger.warn({
      errName: error.name,
      errMessage: error.message,
      requestId: req.id,
      path: req.originalUrl,
      statusCode
    }, 'Respuesta de error de cliente generada');
  }

  if (isPrismaKnown) {
    return res.status(statusCode).json({
      success: false,
      message: statusCode === 409 ? 'El recurso ya existe o hay un conflicto de datos.' : 'Error al procesar la solicitud con la base de datos.',
      code: error.code,
      errorCode: statusToErrorCode[statusCode] || statusToErrorCode[500] || 'INTERNAL_ERROR',
      requestId: req.id
    });
  }

  const errorCode = error.errorCode || statusToErrorCode[statusCode] || 'INTERNAL_ERROR';

  return res.status(statusCode).json({
    success: false,
    message: error.message || 'Error interno del servidor',
    errorCode,
    details: error.details,
    requestId: req.id,
    ...(env.NODE_ENV === 'development' && { stack: error.stack })
  });
};
