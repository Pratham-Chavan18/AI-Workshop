import { Router } from 'express';
import { getReferralStatsHandler } from '../controllers/users.controller';
import { generalRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.get('/:userId/referrals', generalRateLimiter, getReferralStatsHandler);

export default router;
