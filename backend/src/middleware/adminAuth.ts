import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from './logger';

export const requireAdminKey = (req: Request, res: Response, next: NextFunction): void => {
  const providedKey = req.headers['x-admin-key'];
  const expectedKey = process.env.ADMIN_API_KEY;

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
  const providedBuffer = Buffer.from(providedKey);
  const expectedBuffer = Buffer.from(expectedKey);

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Invalid admin key provided.',
      },
    });
    return;
  }

  next();
};
