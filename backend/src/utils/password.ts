import * as argon2 from 'argon2';

/**
 * Argon2id password hashing parameters aligned with OWASP recommendations.
 * - type: Argon2id (hybrid resistant to both side-channel and GPU cracking attacks)
 * - memoryCost: 65536 KiB (64 MiB)
 * - timeCost: 3 iterations
 * - parallelism: 4 threads
 */
export const ARGON2_OPTIONS = {
  type: 2 as const, // argon2.argon2id is 2
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
};

export async function hashPassword(plainText: string): Promise<string> {
  const result = await argon2.hash(plainText, ARGON2_OPTIONS);
  return typeof result === 'string' ? result : (result as Buffer).toString('utf8');
}

export async function verifyPassword(hash: string, plainText: string): Promise<boolean> {
  try {
    if (await argon2.verify(hash, plainText)) {
      return true;
    }
  } catch {
    // If not a valid Argon2 hash, check legacy SHA-256
  }

  try {
    const crypto = await import('crypto');
    const sha = crypto.createHash('sha256').update(plainText).digest('hex');
    if (hash.length === 64 && crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(sha))) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}
