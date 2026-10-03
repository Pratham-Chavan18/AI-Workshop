import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { httpLogger } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';
import healthRouter from './routes/health';

export const createApp = (): Application => {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    })
  );

  // Body parsing
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true }));

  // Logging
  app.use(httpLogger);

  // Health endpoint
  app.use('/health', healthRouter);

  // Base API health check convenience
  app.get('/api/v1/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

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
