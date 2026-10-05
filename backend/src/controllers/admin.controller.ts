import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { verifyPassword } from '../utils/password';
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_TTL_MS,
  signSessionToken,
  getSessionCookieOptions,
} from '../utils/session';
import {
  getCampaignStats,
  getDailyRegistrationTrend,
  getSourceBreakdown,
  getExportDataChunk,
  getTotalExportCount,
} from '../services/admin.service';
import { logger } from '../middleware/logger';

const loginSchema = z.object({
  email: z.string().email('Invalid email address format').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Escapes CSV fields and defends against CSV/formula injection.
 * If a field begins with =, +, -, @, \t, or \r, it is prepended with a single quote (')
 * to prevent spreadsheet engines from interpreting it as an executable formula.
 */
export function sanitizeCsvField(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  let str = String(value);

  // Defend against CSV / formula injection
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Authenticates an administrator via Argon2id password verification and issues a secure HttpOnly session cookie.
 */
export const adminLoginHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid email or password format.',
          details: parseResult.error.format(),
        },
      });
      return;
    }

    const { email, password } = parseResult.data;

    const admin = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (!admin) {
      logger.warn({ email }, 'Admin login failed: Account not found');
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password.',
        },
      });
      return;
    }

    const isValidPassword = await verifyPassword(admin.passwordHash, password);
    if (!isValidPassword) {
      logger.warn({ email }, 'Admin login failed: Invalid credentials');
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password.',
        },
      });
      return;
    }

    const sessionToken = signSessionToken(
      { sub: admin.id, role: admin.role, email: admin.email },
      ADMIN_SESSION_TTL_MS
    );

    res.cookie(
      ADMIN_COOKIE_NAME,
      sessionToken,
      getSessionCookieOptions(ADMIN_SESSION_TTL_MS)
    );

    logger.info({ adminId: admin.id, email: admin.email, role: admin.role }, 'Admin logged in successfully');

    const safeAdmin = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    };

    res.status(200).json({
      success: true,
      admin: safeAdmin,
      data: { admin: safeAdmin },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logs out the administrator by invalidating the HttpOnly session cookie.
 */
export const adminLogoutHandler = (
  req: Request,
  res: Response
): void => {
  if (req.admin) {
    logger.info({ adminId: req.admin.id, email: req.admin.email }, 'Admin logged out');
  }
  res.clearCookie(ADMIN_COOKIE_NAME, getSessionCookieOptions(0));
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

/**
 * Retrieves the identity and role of the currently authenticated administrator.
 */
export const getAdminMeHandler = (
  req: Request,
  res: Response
): void => {
  res.status(200).json({
    success: true,
    admin: req.admin,
  });
};

export const campaignStatsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { campaignId } = req.params;
    const stats = await getCampaignStats(campaignId);
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};

export const dailyTrendHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { campaignId } = req.params;
    const days = Math.max(1, Math.min(90, Number(req.query.days) || 7));
    const trends = await getDailyRegistrationTrend(campaignId, days);
    res.status(200).json(trends);
  } catch (error) {
    next(error);
  }
};

export const sourceBreakdownHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { campaignId } = req.params;
    const sources = await getSourceBreakdown(campaignId);
    res.status(200).json(sources);
  } catch (error) {
    next(error);
  }
};

/**
 * Streams registration data with bounded batching to prevent unbounded memory usage,
 * and sanitizes all user-controlled values against formula injection.
 */
export const exportRegistrationsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { campaignId } = req.params;
    const format = typeof req.query.format === 'string' ? req.query.format.toLowerCase() : 'csv';

    logger.info(
      { adminId: req.admin?.id, email: req.admin?.email, role: req.admin?.role, campaignId, format },
      'Admin export requested'
    );

    const totalCount = await getTotalExportCount(campaignId);

    if (format === 'json') {
      const data = await getExportDataChunk(campaignId, 0, Math.min(totalCount, 5000));
      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="ai-workshop-registrations-${Date.now()}.json"`
      );
      res.status(200).json({ count: data.length, data });
      return;
    }

    // CSV format streaming with chunked retrieval
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="ai-workshop-registrations-${Date.now()}.csv"`
    );

    const headers = [
      'id',
      'fullName',
      'email',
      'phone',
      'collegeName',
      'collegeCity',
      'collegeState',
      'graduationYear',
      'referralCode',
      'referredByUserId',
      'referralsMadeCount',
      'source',
      'registeredAt',
    ];

    res.write(headers.join(',') + '\r\n');

    const CHUNK_SIZE = 500;
    let skip = 0;

    while (skip < totalCount) {
      const batch = await getExportDataChunk(campaignId, skip, CHUNK_SIZE);
      if (batch.length === 0) break;

      for (const item of batch) {
        const row = [
          sanitizeCsvField(item.id),
          sanitizeCsvField(item.fullName),
          sanitizeCsvField(item.email),
          sanitizeCsvField(item.phone),
          sanitizeCsvField(item.collegeName),
          sanitizeCsvField(item.collegeCity),
          sanitizeCsvField(item.collegeState),
          sanitizeCsvField(item.graduationYear),
          sanitizeCsvField(item.referralCode),
          sanitizeCsvField(item.referredByUserId),
          sanitizeCsvField(item.referralsMadeCount),
          sanitizeCsvField(item.source),
          sanitizeCsvField(item.registeredAt),
        ];
        res.write(row.join(',') + '\r\n');
      }

      skip += batch.length;
    }

    res.end();
  } catch (error) {
    next(error);
  }
};
