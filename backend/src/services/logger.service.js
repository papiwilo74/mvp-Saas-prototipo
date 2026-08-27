import pino from 'pino';
import { randomUUID } from 'node:crypto';
import { env } from '../config/env.js';

const isDev = env.NODE_ENV !== 'production';
const isTest = env.NODE_ENV === 'test';

/**
 * Serializador personalizado para requests
 * Incluye información útil para debugging sin exponer datos sensibles
 */
const reqSerializer = (req) => ({
  method: req.method,
  url: req.url,
  path: req.route?.path || req.path,
  ip: req.ip,
  userAgent: req.get('user-agent'),
  userId: req.user?.id,
  storeId: req.user?.storeId || req.user?.restaurantId,
  restaurantId: req.user?.restaurantId,
  requestId: req.id,
  query: Object.keys(req.query).length ? req.query : undefined,
  // No loggear body completo por seguridad, solo en desarrollo
  ...(isDev && req.body && Object.keys(req.body).length ? { body: sanitizeBody(req.body) } : {})
});

/**
 * Serializador para responses
 */
const resSerializer = (res) => ({
  statusCode: res.statusCode,
  responseTime: res.responseTime
});

/**
 * Sanitiza datos sensibles del body antes de loggear
 */
function sanitizeBody(body) {
  if (!body || typeof body !== 'object') return body;
  
  const sensitiveKeys = [
    'password', 'passwordHash', 'newPassword', 'currentPassword',
    'token', 'refreshToken', 'accessToken', 'resetToken',
    'pin', 'cvv', 'cardNumber', 'cardExpiry',
    'secret', 'apiKey', 'privateKey'
  ];
  
  const sanitized = { ...body };
  
  for (const key of Object.keys(sanitized)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(k => lowerKey.includes(k))) {
      sanitized[key] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

/**
 * Logger principal configurado para producción
 */
export const logger = pino({
  level: isTest ? 'silent' : (isDev ? 'debug' : 'info'),
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: { 
          colorize: true, 
          translateTime: 'SYS:standard', 
          ignore: 'pid,hostname',
          singleLine: false
        }
      }
    : undefined,
  serializers: {
    req: reqSerializer,
    res: resSerializer,
    err: pino.stdSerializers.err
  },
  // Agregar timestamp ISO estándar
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
  // Formato base para todos los logs
  base: {
    service: 'tutienda-saas-api',
    environment: env.NODE_ENV,
    version: process.env.npm_package_version || 'unknown'
  }
});

/**
 * Crea un logger hijo con contexto adicional
 * Útil para módulos específicos: logger.child({ module: 'orders' })
 */
export function createChildLogger(bindings) {
  return logger.child(bindings);
}

/**
 * Loggea un error con contexto completo
 * Útil en catch blocks y error handlers
 */
export function logError(loggerInstance, error, context = {}) {
  const err = error instanceof Error ? error : new Error(String(error));
  
  loggerInstance.error({
    err,
    ...context,
    // Contexto adicional automático
    errorName: err.name,
    errorMessage: err.message,
    stack: err.stack
  }, context.message || 'Error capturado');
}

/**
 * Loggea información de auditoría/acciones importantes
 */
export function logAudit(loggerInstance, action, details = {}) {
  loggerInstance.info({
    audit: true,
    action,
    ...details,
    timestamp: new Date().toISOString()
  }, `Audit: ${action}`);
}

/**
 * Loggea métricas de performance
 */
export function logMetric(loggerInstance, metricName, value, unit = 'ms', tags = {}) {
  loggerInstance.info({
    metric: true,
    metricName,
    value,
    unit,
    ...tags,
    timestamp: new Date().toISOString()
  }, `Metric: ${metricName}=${value}${unit}`);
}

/**
 * Loggea eventos de seguridad
 */
export function logSecurity(loggerInstance, event, details = {}) {
  loggerInstance.warn({
    security: true,
    event,
    ...details,
    timestamp: new Date().toISOString()
  }, `Security event: ${event}`);
}

/**
 * Middleware para agregar requestId y logging automático de requests
 */
export function requestLogger() {
  return (req, res, next) => {
    // Generar requestId si no existe
    req.id = req.id || req.headers['x-request-id'] || randomUUID();
    
    // Agregar responseTime
    const start = process.hrtime.bigint();
    res.on('finish', () => {
      const end = process.hrtime.bigint();
      res.responseTime = Number(end - start) / 1_000_000; // ms
    });
    
    // Logger con requestId para este request
    req.log = logger.child({ requestId: req.id });
    
    // Log request entrante (solo en debug para no saturar)
    if (isDev) {
      req.log.debug({ req }, 'Incoming request');
    }
    
    // Log response al terminar
    res.on('finish', () => {
      const level = res.statusCode >= 500 ? 'error' : 
                    res.statusCode >= 400 ? 'warn' : 
                    'info';
      
      req.log[level]({ req, res }, 
        `${req.method} ${req.url} ${res.statusCode} - ${res.responseTime?.toFixed(2)}ms`
      );
    });
    
    next();
  };
}
