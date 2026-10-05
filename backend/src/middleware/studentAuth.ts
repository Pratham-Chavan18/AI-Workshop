import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import {
  STUDENT_COOKIE_NAME,
  verifySessionToken,
  getSessionCookieOptions,
} from '../utils/session';

export interface AuthenticatedStudent {
  id: string;
  campaignId: string;
  collegeId: string;
  fullName: string;
  email: string;
  emailNormalized: string;
  phone: string | null;
  phoneNormalized: string | null;
  graduationYear: number;
  referralCode: string;
  referredByUserId: string | null;
  source: string;
  createdAt: Date;
}

declare global {
  namespace Express {
    interface Request {
      student?: AuthenticatedStudent;
    }
  }
}

export const requireStudentSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token =
    req.cookies?.[STUDENT_COOKIE_NAME] ||
    req.headers['authorization']?.replace(/^Bearer\s+/i, '');

  if (!token) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Student authentication required. Please register or sign in.',
      },
    });
    return;
  }

  const payload = verifySessionToken(token);
  if (!payload || !payload.sub) {
    res.clearCookie(STUDENT_COOKIE_NAME, getSessionCookieOptions(0));
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired student session.',
      },
    });
    return;
  }

  try {
    const student = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!student) {
      res.clearCookie(STUDENT_COOKIE_NAME, getSessionCookieOptions(0));
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Student account not found or session is no longer active.',
        },
      });
      return;
    }

    req.student = student;
    next();
  } catch (error) {
    next(error);
  }
};
