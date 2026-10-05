import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

export const registrationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === 'development' || env.NODE_ENV === 'test' ? 500 : 10, // Generous in dev/test, strict in production
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many registration attempts from this IP. Please try again after 15 minutes.',
    },
  },
});

export const emailRegistrationRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: env.NODE_ENV === 'development' || env.NODE_ENV === 'test' ? 500 : 3, // 3 attempts per email per 10 minutes in prod
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = req.body?.email ? String(req.body.email).toLowerCase().trim() : '';
    const phone = req.body?.phone ? String(req.body.phone).trim() : '';
    return email || phone || req.ip || 'unknown';
  },
  validate: { xForwardedForHeader: false, default: false },
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many registration attempts for this email. Please try again after 10 minutes.',
    },
  },
});

export const leaderboardRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // max 60 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many leaderboard requests. Please slow down.',
    },
  },
});

export const adminRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // max 30 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many admin API requests. Please slow down.',
    },
  },
});

export const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});
