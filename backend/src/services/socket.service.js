import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { verifyToken } from '../utils/token.js';
import cookie from 'cookie';

let io = null;

const verifySocketToken = (handshake) => {
  const authToken = handshake.auth?.token;
  if (authToken) {
    try { return verifyToken(authToken); } catch { return null; }
  }

  const cookies = handshake.headers?.cookie;
  if (cookies) {
    const parsed = cookie.parse(cookies);
    const token = parsed.ff_token;
    if (token) {
      try { return verifyToken(token); } catch { return null; }
    }
  }

  return null;
};

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: [env.FRONTEND_URL, ...(env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()) : [])],
      credentials: true
    }
  });

  io.use((socket, next) => {
    const payload = verifySocketToken(socket.handshake);
    if (payload) {
      socket.data.user = payload;
      return next();
    }
    return next(new Error('Autenticacion requerida para conexion WebSocket'));
  });

  io.on('connection', (socket) => {
    const { restaurantId } = socket.handshake.query;

    if (restaurantId) {
      const userRestaurantId = socket.data.user?.restaurantId;
      if (userRestaurantId && userRestaurantId !== restaurantId) {
        socket.disconnect();
        return;
      }
      socket.join(`restaurant:${restaurantId}`);
      socket.join(`kitchen:${restaurantId}`);
    }

    socket.on('join-admin', (rid) => {
      const userRestaurantId = socket.data.user?.restaurantId;
      if (userRestaurantId && userRestaurantId !== rid) {
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
  io.to(`kitchen:${restaurantId}`).emit('kitchen-updated', order);
}

export function getIO() {
  return io;
}
