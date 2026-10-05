import { Router } from 'express';
import { searchCollegesHandler } from '../controllers/colleges.controller';
import { generalRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.get('/', generalRateLimiter, searchCollegesHandler);

export default router;
