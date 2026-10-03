import rateLimit from 'express-rate-limit';

export const registrationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 requests per window
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

export const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});
