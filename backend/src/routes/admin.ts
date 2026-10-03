import { Router } from 'express';
import {
  campaignStatsHandler,
  dailyTrendHandler,
  sourceBreakdownHandler,
  exportRegistrationsHandler,
} from '../controllers/admin.controller';
import { requireAdminKey } from '../middleware/adminAuth';
import { adminRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Apply auth and rate limiting to all admin endpoints
router.use(adminRateLimiter);
router.use(requireAdminKey);

router.get('/campaigns/:campaignId/stats', campaignStatsHandler);
router.get('/campaigns/:campaignId/stats/daily', dailyTrendHandler);
router.get('/campaigns/:campaignId/stats/sources', sourceBreakdownHandler);
router.get('/campaigns/:campaignId/export', exportRegistrationsHandler);

export default router;
