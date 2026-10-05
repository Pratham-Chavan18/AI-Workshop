import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// Base health endpoint
router.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Liveness probe: verifies process is running
router.get('/live', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
  });
});

// Readiness probe: verifies database connectivity within a bounded timeout
router.get('/ready', async (_req: Request, res: Response) => {
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database ping timed out')), 3000)
      ),
    ]);

    res.status(200).json({
      status: 'ready',
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'degraded',
      database: 'disconnected',
    });
  }
});

export default router;
