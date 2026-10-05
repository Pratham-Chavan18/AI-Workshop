import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from './logger';
import { AppError } from '../utils/errors';
import { env } from '../config/env';

export { AppError };

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    logger.warn({ code: err.code, message: err.message, details: err.details }, 'Handled AppError');
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  if (err instanceof ZodError) {
    logger.warn({ issues: err.issues }, 'Zod validation error');
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request payload',
        details: err.flatten().fieldErrors,
      },
    });
    return;
  }

  // Fallback handler for raw Prisma P2002 unique constraint violations
  if ((err as any).code === 'P2002') {
    const target = (err as any).meta?.target;
    const targetFields = Array.isArray(target) ? target : typeof target === 'string' ? [target] : [];
    const isEmail = targetFields.some((f: string) => f.includes('emailNormalized') || f.includes('email'));
    const isPhone = targetFields.some((f: string) => f.includes('phoneNormalized') || f.includes('phone'));
    const code = isEmail
      ? 'EMAIL_ALREADY_REGISTERED'
      : isPhone
        ? 'PHONE_ALREADY_REGISTERED'
        : 'DUPLICATE_REGISTRATION';
    const message = isEmail
      ? 'This email is already registered for the workshop'
      : isPhone
        ? 'This phone number is already registered for the workshop'
        : 'A registration with these details already exists';
    logger.warn({ code, message, target: targetFields }, 'Mapped Prisma P2002 error in errorHandler');
    res.status(409).json({
      success: false,
      error: { code, message },
    });
    return;
  }

  logger.error(err, 'Unhandled Server Error');
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
    },
  });
};
