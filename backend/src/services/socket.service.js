import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { env } from '../config/env.js';

let io = null;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: [env.FRONTEND_URL, ...(env.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()) : [])],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    const { restaurantId } = socket.handshake.query;
    if (restaurantId) {
      socket.join(`restaurant:${restaurantId}`);
      socket.join(`kitchen:${restaurantId}`);
    }

    socket.on('join-admin', (rid) => {
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
