import { createServer } from 'http';
import { app } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';
import { initSocket, getIO } from './services/socket.service.js';
import { logger } from './services/logger.service.js';

const httpServer = createServer(app);

initSocket(httpServer);

httpServer.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, 'API iniciada');
});

const shutdown = async (signal) => {
  logger.info({ signal }, 'Shutdown signal recibida. Cerrando servidores...');
  httpServer.close(async () => {
    const io = getIO();
    if (io) {
      io.close();
      logger.info('Socket.IO cerrado');
    }
    await prisma.$disconnect();
    logger.info('Prisma desconectado');
    process.exit(0);
  });
  setTimeout(() => {
    logger.error('Shutdown forzado por timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
