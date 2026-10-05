import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { getReferralStats } from '../services/referral.service';
import {
  STUDENT_COOKIE_NAME,
  getSessionCookieOptions,
} from '../utils/session';

const uuidSchema = z.string().uuid();

/**
 * Retrieves dashboard and referral stats for the currently authenticated student.
 * Server derives identity strictly from HttpOnly session (preventing IDOR).
 */
export const getMyDashboardHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const student = req.student;
    if (!student) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Student authentication required.',
        },
      });
      return;
    }

    const stats = await getReferralStats(student.id, student.campaignId);
    const safeStudent = {
      id: student.id,
      fullName: student.fullName,
      email: student.email,
      collegeId: student.collegeId,
      campaignId: student.campaignId,
    };

    res.status(200).json({
      success: true,
      student: safeStudent,
      data: {
        ...safeStudent,
        ...stats,
      },
      ...stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Access-controlled referral stats handler for legacy or explicit routes.
 * Strictly verifies that the authenticated student matches the requested userId.
 */
export const getReferralStatsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const student = req.student;
    if (!student) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Student authentication required.',
        },
      });
      return;
    }

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

    // IDOR protection: strictly enforce that students can only view their own dashboard
    if (student.id !== userId) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied. You cannot view another student’s dashboard.',
        },
      });
      return;
    }

    const stats = await getReferralStats(student.id, student.campaignId);
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

/**
 * Logs out the student by invalidating the HttpOnly session cookie.
 */
export const logoutStudentHandler = (
  _req: Request,
  res: Response
): void => {
  res.clearCookie(STUDENT_COOKIE_NAME, getSessionCookieOptions(0));
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};
