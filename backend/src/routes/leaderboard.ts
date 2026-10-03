import { Router } from 'express';
import {
  campusLeaderboardHandler,
  referrerLeaderboardHandler,
} from '../controllers/leaderboard.controller';
import { leaderboardRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.get('/campuses', leaderboardRateLimiter, campusLeaderboardHandler);
router.get('/referrers', leaderboardRateLimiter, referrerLeaderboardHandler);

export default router;
