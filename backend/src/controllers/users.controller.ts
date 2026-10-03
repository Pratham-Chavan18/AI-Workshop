import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { getReferralStats } from '../services/referral.service';

const uuidSchema = z.string().uuid();

export const getReferralStatsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const parseResult = uuidSchema.safeParse(userId);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid user ID format. Must be a valid UUID.',
        },
      });
      return;
    }

    const stats = await getReferralStats(userId);
    res.status(200).json(stats);
  } catch (error: any) {
    if (error.code === 'NOT_FOUND') {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Student profile not found',
        },
      });
      return;
    }
    next(error);
  }
};
