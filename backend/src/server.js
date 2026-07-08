import { createServer } from 'http';
import { app } from './app.js';
import { env } from './config/env.js';
import { initSocket } from './services/socket.service.js';

const httpServer = createServer(app);

initSocket(httpServer);

httpServer.listen(env.PORT, () => {
  console.log(`API escuchando en http://localhost:${env.PORT}`);
});
