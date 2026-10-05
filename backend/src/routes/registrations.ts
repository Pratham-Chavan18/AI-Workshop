import { Router } from 'express';
import { registerStudentHandler } from '../controllers/registration.controller';
import { registrationSchema } from '../validators/registration.validator';
import { validate } from '../middleware/validate';
import { registrationRateLimiter, emailRegistrationRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post(
  '/',
  registrationRateLimiter,
  emailRegistrationRateLimiter,
  validate(registrationSchema),
  registerStudentHandler
);

export default router;
