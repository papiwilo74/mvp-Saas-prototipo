import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { verifyToken } from '../utils/token.js';
import { parseCookie } from 'cookie';

let io = null;

const verifySocketToken = (handshake) => {
  const authToken = handshake.auth?.token;
  if (authToken) {
    try { return verifyToken(authToken); } catch { return null; }
  }

  const cookies = handshake.headers?.cookie;
  if (cookies) {
    const parsed = parseCookie(cookies);
    const token = parsed.ff_token;
    if (token) {
      try { return verifyToken(token); } catch { return null; }
    }
  }

  return null;
};

const normalizeOrigin = (url) => (typeof url === 'string' ? url.trim().replace(/\/+$/, '') : '');

const expandOriginVariants = (originUrl) => {
  const clean = normalizeOrigin(originUrl);
  if (!clean) return [];
  try {
    const parsed = new URL(clean);
    if (parsed.hostname.startsWith('www.')) {
      const nonWww = new URL(clean);
      nonWww.hostname = parsed.hostname.replace(/^www\./, '');
      return [clean, normalizeOrigin(nonWww.origin)];
    } else if (parsed.hostname !== 'localhost' && !parsed.hostname.match(/^(\d{1,3}\.){3}\d{1,3}$/)) {
      const withWww = new URL(clean);
      withWww.hostname = `www.${parsed.hostname}`;
      return [clean, normalizeOrigin(withWww.origin)];
    }
    return [clean];
  } catch {
    return [clean];
  }
};

const rawSocketOrigins = [
  env.FRONTEND_URL,
  ...(env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(',') : [])
];

const allowedSocketOrigins = Array.from(new Set(rawSocketOrigins.flatMap(expandOriginVariants).filter(Boolean)));

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const cleanOrigin = normalizeOrigin(origin);
        if (allowedSocketOrigins.includes(cleanOrigin)) {
          return callback(null, true);
        }
        return callback(new Error('Origen no permitido por CORS en Socket.IO'));
      },
      credentials: true
    }
  });

  io.use((socket, next) => {
    const payload = verifySocketToken(socket.handshake);
    if (payload) {
      socket.data.user = payload;
    }
    // Permitimos conexión para clientes (guests) para seguir estado de pedidos
    return next();
  });

  io.on('connection', (socket) => {
    const { restaurantId, orderId } = socket.handshake.query;

    if (restaurantId) {
      // Sala pública para el restaurante (clientes y administradores ven esto)
      socket.join(`restaurant:${restaurantId}`);
      
      // Solo el personal del restaurante y superadmins se unen a la cocina
      const role = socket.data.user?.role;
      if (role === 'ADMIN' || role === 'SUPERADMIN' || role === 'KITCHEN') {
        socket.join(`kitchen:${restaurantId}`);
      }
    }

    if (orderId) {
      socket.join(`order:${orderId}`);
    }

    socket.on('join-admin', (rid) => {
      // Este evento explícito requiere autenticación
      if (!socket.data.user) {
        socket.emit('error', 'Autenticacion requerida');
        return;
      }

      const userRestaurantId = socket.data.user?.restaurantId;
      if (userRestaurantId && userRestaurantId !== rid && socket.data.user.role !== 'SUPERADMIN') {
        socket.emit('error', 'No autorizado para este restaurante');
        return;
      }
      
      socket.join(`restaurant:${rid}`);
      socket.join(`kitchen:${rid}`);
    });

    socket.on('disconnect', () => {});
  });

  return io;
}

export function emitNewOrder(restaurantId, order) {
  if (!io) return;
  io.to(`restaurant:${restaurantId}`).emit('new-order', order);
  io.to(`kitchen:${restaurantId}`).emit('kitchen-order', order);
}

export function emitOrderStatusChanged(restaurantId, order) {
  if (!io) return;
  io.to(`restaurant:${restaurantId}`).emit('order-updated', order);
  io.to(`restaurant:${restaurantId}`).emit('order-status-changed', order);
  io.to(`kitchen:${restaurantId}`).emit('kitchen-updated', order);
  if (order?.id) {
    io.to(`order:${order.id}`).emit('order-updated', order);
    io.to(`order:${order.id}`).emit('order-status-changed', order);
  }
}

export function getIO() {
  return io;
}
