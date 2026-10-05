import { Request, Response, NextFunction } from 'express';
import { registerStudent } from '../services/registration.service';
import {
  STUDENT_COOKIE_NAME,
  STUDENT_SESSION_TTL_MS,
  signSessionToken,
  getSessionCookieOptions,
} from '../utils/session';

export const registerStudentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await registerStudent(req.body);

    // Issue secure HttpOnly session cookie for authenticated student dashboard access
    const sessionToken = signSessionToken(
      { sub: result.user.id, role: 'student', campaignId: result.campaignId },
      STUDENT_SESSION_TTL_MS
    );
    res.cookie(
      STUDENT_COOKIE_NAME,
      sessionToken,
      getSessionCookieOptions(STUDENT_SESSION_TTL_MS)
    );

    res.status(201).json({
      success: true,
      user: result.user,
      data: result.user,
    });
  } catch (error) {
    next(error);
  }
};
