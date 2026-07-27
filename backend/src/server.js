import { createServer } from 'http';
import { app } from './app.js';
import { env } from './config/env.js';
import { initSocket } from './services/socket.service.js';
import { logger } from './services/logger.service.js';

const httpServer = createServer(app);

initSocket(httpServer);

httpServer.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, 'API iniciada');
});
