import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { httpLogger, logger } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';
import { env } from './config/env';
import { prisma } from './lib/prisma';
import healthRouter from './routes/health';
import collegesRouter from './routes/colleges';
import registrationsRouter from './routes/registrations';
import campaignsRouter from './routes/campaigns';
import usersRouter from './routes/users';
import leaderboardRouter from './routes/leaderboard';
import adminRouter from './routes/admin';

export const createApp = (): Application => {
  const app = express();

  // Security middleware
  app.use(
    helmet({
      contentSecurityPolicy: env.NODE_ENV === 'production',
      hsts: env.NODE_ENV === 'production',
    })
  );

  // CORS configuration
  if (env.NODE_ENV === 'development' && env.CORS_ORIGIN.length === 0) {
    logger.warn('CORS_ORIGIN is unset in development mode; defaulting allowed origins to ["http://localhost:5173"]');
  }

  const allowedOrigins =
    env.NODE_ENV === 'development' || env.NODE_ENV === 'test'
      ? Array.from(new Set([...env.CORS_ORIGIN, 'http://localhost:5173']))
      : env.CORS_ORIGIN;

  app.use(
    cors({
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Blocked by CORS policy'));
      },
      credentials: true,
    })
  );

  // Body and Cookie parsing
  app.use(cookieParser());
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true }));

  // Logging
  app.use(httpLogger);

  // Health and Observability endpoints (mounted without auth)
  app.use('/health', healthRouter);
  app.get('/liveness', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
  });
  app.get('/readiness', async (_req: Request, res: Response) => {
    try {
      await Promise.race([
        prisma.$queryRaw`SELECT 1`,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Database ping timed out')), 1000)
        ),
      ]);
      res.status(200).json({ status: 'ready', database: 'connected' });
    } catch {
      res.status(503).json({ status: 'degraded', database: 'disconnected' });
    }
  });
  app.get('/api/v1/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
  });

  // API v1 routes
  app.use('/api/v1/colleges', collegesRouter);
  app.use('/api/v1/registrations', registrationsRouter);
  app.use('/api/registrations', registrationsRouter);
  app.use('/api/v1/campaigns', campaignsRouter);
  app.use('/api/v1/users', usersRouter);
  app.use('/api/v1/leaderboard', leaderboardRouter);
  app.use('/api/v1/admin', adminRouter);

  // 404 Handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Route not found',
      },
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};

export const app = createApp();
export default app;
