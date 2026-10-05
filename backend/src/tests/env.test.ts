import { describe, it, expect } from 'vitest';
import { envSchema } from '../config/env';

describe('Environment Variable Validation & Parsing', () => {
  const baseEnv = {
    DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/test_db',
  };

  describe('CORS_ORIGIN parsing', () => {
    it('should split comma-separated origins and trim whitespace', () => {
      const parsed = envSchema.parse({
        ...baseEnv,
        CORS_ORIGIN: 'https://a.com, https://b.com',
      });
      expect(parsed.CORS_ORIGIN).toEqual(['https://a.com', 'https://b.com']);
    });

    it('should parse empty string to an empty array', () => {
      const parsed = envSchema.parse({
        ...baseEnv,
        CORS_ORIGIN: '',
      });
      expect(parsed.CORS_ORIGIN).toEqual([]);
    });

    it('should parse undefined to an empty array', () => {
      const parsed = envSchema.parse(baseEnv);
      expect(parsed.CORS_ORIGIN).toEqual([]);
    });
  });

  describe('SHUTDOWN_TIMEOUT_MS validation', () => {
    it('should default to 10000 when undefined', () => {
      const parsed = envSchema.parse(baseEnv);
      expect(parsed.SHUTDOWN_TIMEOUT_MS).toBe(10000);
    });

    it('should accept valid positive integer string', () => {
      const parsed = envSchema.parse({
        ...baseEnv,
        SHUTDOWN_TIMEOUT_MS: '15000',
      });
      expect(parsed.SHUTDOWN_TIMEOUT_MS).toBe(15000);
    });

    it('should reject non-positive timeout values', () => {
      const resultZero = envSchema.safeParse({
        ...baseEnv,
        SHUTDOWN_TIMEOUT_MS: '0',
      });
      expect(resultZero.success).toBe(false);

      const resultNegative = envSchema.safeParse({
        ...baseEnv,
        SHUTDOWN_TIMEOUT_MS: '-5000',
      });
      expect(resultNegative.success).toBe(false);
    });

    it('should reject non-integer timeout values', () => {
      const resultFloat = envSchema.safeParse({
        ...baseEnv,
        SHUTDOWN_TIMEOUT_MS: '5000.5',
      });
      expect(resultFloat.success).toBe(false);
    });
  });

  describe('DATABASE_URL validation', () => {
    it('should require DATABASE_URL and reject non-URL strings', () => {
      const resultMissing = envSchema.safeParse({});
      expect(resultMissing.success).toBe(false);

      const resultInvalid = envSchema.safeParse({
        DATABASE_URL: 'not-a-valid-url',
      });
      expect(resultInvalid.success).toBe(false);
    });
  });

  describe('PORT validation', () => {
    it('should default to 3000 when undefined', () => {
      const parsed = envSchema.parse(baseEnv);
      expect(parsed.PORT).toBe(3000);
    });

    it('should coerce valid integer port from 1 through 65535', () => {
      const parsed = envSchema.parse({
        ...baseEnv,
        PORT: '4000',
      });
      expect(parsed.PORT).toBe(4000);
    });

    it('should reject port below 1', () => {
      const res = envSchema.safeParse({
        ...baseEnv,
        PORT: '0',
      });
      expect(res.success).toBe(false);
    });

    it('should reject port above 65535', () => {
      const res = envSchema.safeParse({
        ...baseEnv,
        PORT: '70000',
      });
      expect(res.success).toBe(false);
    });
  });

  describe('ADMIN_API_KEY production safety', () => {
    it('should reject placeholder replace_in_secret_manager in production', () => {
      const res = envSchema.safeParse({
        ...baseEnv,
        NODE_ENV: 'production',
        CORS_ORIGIN: 'https://workshop.nxtwave.com',
        SESSION_SECRET: 'a-very-secure-random-secret-for-production-session-keys',
        ADMIN_API_KEY: 'replace_in_secret_manager',
      });
      expect(res.success).toBe(false);
    });

    it('should reject short ADMIN_API_KEY in production', () => {
      const res = envSchema.safeParse({
        ...baseEnv,
        NODE_ENV: 'production',
        CORS_ORIGIN: 'https://workshop.nxtwave.com',
        SESSION_SECRET: 'a-very-secure-random-secret-for-production-session-keys',
        ADMIN_API_KEY: 'too-short',
      });
      expect(res.success).toBe(false);
    });

    it('should accept valid ADMIN_API_KEY in production', () => {
      const res = envSchema.safeParse({
        ...baseEnv,
        NODE_ENV: 'production',
        CORS_ORIGIN: 'https://workshop.nxtwave.com',
        SESSION_SECRET: 'a-very-secure-random-secret-for-production-session-keys',
        ADMIN_API_KEY: 'a-secure-32-char-random-admin-key-for-prod',
      });
      expect(res.success).toBe(true);
    });
  });
});
