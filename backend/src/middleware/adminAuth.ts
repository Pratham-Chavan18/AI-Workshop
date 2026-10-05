import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import {
  ADMIN_COOKIE_NAME,
  verifySessionToken,
  getSessionCookieOptions,
} from '../utils/session';

export interface AuthenticatedAdmin {
  id: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
}

declare global {
  namespace Express {
    interface Request {
      admin?: AuthenticatedAdmin;
    }
  }
}

/**
 * Middleware requiring an authenticated admin session via HttpOnly cookie or Authorization Bearer header.
 */
export const requireAdminSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token =
    req.cookies?.[ADMIN_COOKIE_NAME] ||
    req.headers['authorization']?.replace(/^Bearer\s+/i, '');

  if (!token) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Admin authentication required. Please sign in.',
      },
    });
    return;
  }

  const payload = verifySessionToken(token);
  if (!payload || !payload.sub) {
    res.clearCookie(ADMIN_COOKIE_NAME, getSessionCookieOptions(0));
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired admin session. Please log in again.',
      },
    });
    return;
  }

  try {
    const admin = await prisma.adminUser.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true },
    });

    if (!admin) {
      res.clearCookie(ADMIN_COOKIE_NAME, getSessionCookieOptions(0));
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Admin account not found or has been revoked.',
        },
      });
      return;
    }

    req.admin = {
      id: admin.id,
      email: admin.email,
      role: admin.role as 'admin' | 'operator' | 'viewer',
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware enforcing role-based access control for administrative actions.
 * Allowed roles: 'admin', 'operator', 'viewer'.
 */
export const requireAdminRole = (
  allowedRoles: Array<'admin' | 'operator' | 'viewer'>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Admin authentication required.',
        },
      });
      return;
    }

    if (!allowedRoles.includes(req.admin.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Insufficient permissions. Operation requires one of the following roles: [${allowedRoles.join(', ')}].`,
        },
      });
      return;
    }

    next();
  };
};
