import 'dotenv/config';
import { app } from './app';
import { logger } from './middleware/logger';
import { env } from './config/env';
import { prisma } from './lib/prisma';

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  logger.info(
    {
      port: PORT,
      env: env.NODE_ENV,
    },
    'Server successfully started'
  );
});

// Graceful shutdown handling
const gracefulShutdown = (signal: string) => {
  logger.info({ signal }, 'Received termination signal, shutting down gracefully...');
  server.close(async () => {
    logger.info('HTTP server closed');
    try {
      await prisma.$disconnect();
      logger.info('Prisma disconnected successfully');
    } catch (err) {
      logger.error({ err }, 'Error disconnecting Prisma during shutdown');
    }
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, env.SHUTDOWN_TIMEOUT_MS);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default server;
