import { Router } from 'express';
import {
  adminLoginHandler,
  adminLogoutHandler,
  getAdminMeHandler,
  campaignStatsHandler,
  dailyTrendHandler,
  sourceBreakdownHandler,
  exportRegistrationsHandler,
} from '../controllers/admin.controller';
import {
  requireAdminSession,
  requireAdminRole,
} from '../middleware/adminAuth';
import { adminRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Apply rate limiting to all admin routes
router.use(adminRateLimiter);

// 1. Authentication endpoints
router.post('/auth/login', adminLoginHandler);
router.post('/auth/logout', adminLogoutHandler);

// 2. Protected Session Gatekeeper
router.use(requireAdminSession);

router.get('/auth/me', getAdminMeHandler);

// 3. Analytics endpoints (Accessible to admin, operator, and viewer roles)
router.get(
  '/campaigns/:campaignId/stats',
  requireAdminRole(['admin', 'operator', 'viewer']),
  campaignStatsHandler
);
router.get(
  '/campaigns/:campaignId/stats/daily',
  requireAdminRole(['admin', 'operator', 'viewer']),
  dailyTrendHandler
);
router.get(
  '/campaigns/:campaignId/stats/sources',
  requireAdminRole(['admin', 'operator', 'viewer']),
  sourceBreakdownHandler
);

// 4. Privileged Data Export endpoint (Accessible strictly to admin and operator roles; viewer rejected)
router.get(
  '/campaigns/:campaignId/export',
  requireAdminRole(['admin', 'operator']),
  exportRegistrationsHandler
);

export default router;
