import { Request, Response, NextFunction } from 'express';
import { timingSafeEqual } from 'crypto';
import { logger } from './logger';
import { env } from '../config/env';

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export const requireAdminKey = (req: Request, res: Response, next: NextFunction): void => {
  const providedKey = req.headers['x-admin-key'];
  const expectedKey = process.env.ADMIN_API_KEY || env.ADMIN_API_KEY;

  if (!expectedKey) {
    logger.error('ADMIN_API_KEY environment variable is not configured');
    res.status(503).json({
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Admin authentication is currently unconfigured',
      },
    });
    return;
  }

  if (!providedKey || typeof providedKey !== 'string') {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Admin authentication required. Missing X-Admin-Key header.',
      },
    });
    return;
  }

  // Timing-safe comparison to prevent timing attacks
  if (!safeEqual(providedKey, expectedKey)) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid admin key provided.',
      },
    });
    return;
  }

  next();
};
