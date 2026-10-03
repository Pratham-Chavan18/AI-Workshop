import crypto from 'crypto';
import { prisma } from '../lib/prisma';

// Safe charset excluding lookalike characters: 0, O, 1, I
const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export async function generateReferralCode(maxAttempts = 10): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const bytes = crypto.randomBytes(6);
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += CHARSET[bytes[i] % CHARSET.length];
    }

    // Check if code already exists in DB
    const existing = await prisma.user.findUnique({
      where: { referralCode: code },
      select: { id: true },
    });

    if (!existing) {
      return code;
    }
  }

  throw new Error('Failed to generate a unique referral code after multiple attempts');
}

export function buildReferralUrl(code: string, baseUrl?: string): string {
  const base = baseUrl || process.env.FRONTEND_URL || 'http://localhost:5173';
  const cleanBase = base.replace(/\/$/, '');
  return `${cleanBase}/register?ref=${code}`;
}
