import { Router } from 'express';
import {
  getMyDashboardHandler,
  getReferralStatsHandler,
  logoutStudentHandler,
} from '../controllers/users.controller';
import { requireStudentSession } from '../middleware/studentAuth';
import { generalRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Primary authenticated session-derived dashboard endpoints (No IDOR possible)
router.get('/me', generalRateLimiter, requireStudentSession, getMyDashboardHandler);
router.get('/me/dashboard', generalRateLimiter, requireStudentSession, getMyDashboardHandler);
router.post('/logout', logoutStudentHandler);

// Access-controlled endpoint (enforces that student session matches :userId, returning 403 on mismatch)
router.get('/:userId/referrals', generalRateLimiter, requireStudentSession, getReferralStatsHandler);

export default router;
