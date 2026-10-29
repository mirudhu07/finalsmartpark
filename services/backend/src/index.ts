import http from 'http';
import { createApp } from './app';
import { connectDatabase } from './db';
import { initSocketIO } from './socket';
import { config } from './config';

async function bootstrap() {
  console.log('--------------------------------------------------');
  console.log(' Starting SmartPark AI Backend REST API Server   ');
  console.log('--------------------------------------------------');

  // Connect to persistent MongoDB storage
  await connectDatabase();

  const app = createApp();
  const server = http.createServer(app);

  // Initialize Socket.IO
  initSocketIO(server, config.corsOrigins);

  server.listen(config.port, () => {
    console.log(`[Server] SmartPark REST API listening on http://localhost:${config.port}`);
    console.log(`[Server] Health check endpoint: http://localhost:${config.port}/api/v1/health`);
    console.log(`[Server] Environment: ${config.nodeEnv}`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`[Server] Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('[Server] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('[Server] Fatal startup failure:', err);
  process.exit(1);
});
