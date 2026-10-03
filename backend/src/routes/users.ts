import { Router } from 'express';
import { getReferralStatsHandler } from '../controllers/users.controller';

const router = Router();

router.get('/:userId/referrals', getReferralStatsHandler);

export default router;
