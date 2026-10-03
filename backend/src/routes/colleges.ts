import { Router } from 'express';
import { searchCollegesHandler } from '../controllers/colleges.controller';

const router = Router();

router.get('/', searchCollegesHandler);

export default router;
