import crypto from 'crypto';
import { CookieOptions } from 'express';
import { env } from '../config/env';

export interface SessionPayload {
  sub: string; // User ID or Admin ID
  role?: string; // e.g. 'admin', 'operator', 'viewer', 'student'
  email?: string;
  campaignId?: string;
  iat: number;
  exp: number;
}

const getSecret = (): string => {
  return env.SESSION_SECRET || 'dev-secret-key-must-be-changed-in-production-at-least-32-chars';
};

/**
 * Creates a cryptographically signed, tamper-proof session token.
 * Format: base64url(payload).base64url(hmac-sha256-signature)
 */
export function signSessionToken(
  claims: { sub: string; role?: string; campaignId?: string; email?: string },
  expiresInMs: number
): string {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + Math.floor(expiresInMs / 1000);

  const payload: SessionPayload = {
    ...claims,
    iat: now,
    exp,
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSecret())
    .update(payloadBase64)
    .digest('base64url');

  return `${payloadBase64}.${signature}`;
}

/**
 * Verifies a signed session token.
 * Returns decoded SessionPayload if valid and unexpired, null otherwise.
 */
export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token || typeof token !== 'string') {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return null;
  }

  const [payloadBase64, signature] = parts;

  const expectedSignature = crypto
    .createHmac('sha256', getSecret())
    .update(payloadBase64)
    .digest('base64url');

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf8');
    const payload: SessionPayload = JSON.parse(payloadJson);

    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < now) {
      return null; // Expired session
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Generates secure HttpOnly cookie options for student and admin sessions.
 */
export function getSessionCookieOptions(maxAgeMs: number): CookieOptions {
  const isProd = env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax', // 'none' enables cross-site cookie usage between frontend and backend domains with secure: true
    maxAge: maxAgeMs,
    path: '/',
  };
}

export const STUDENT_COOKIE_NAME = 'aiw_student_session';
export const ADMIN_COOKIE_NAME = 'aiw_admin_session';

export const STUDENT_SESSION_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days
export const ADMIN_SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

export function createStudentSessionToken(userId: string, campaignId?: string): string {
  return signSessionToken({ sub: userId, role: 'student', campaignId }, STUDENT_SESSION_TTL_MS);
}

export function createAdminSessionToken(adminId: string, email: string, role: string): string {
  return signSessionToken({ sub: adminId, role }, ADMIN_SESSION_TTL_MS);
}

