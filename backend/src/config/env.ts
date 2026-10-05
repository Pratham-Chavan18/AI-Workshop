import 'dotenv/config';
import { z } from 'zod';

export const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    DATABASE_URL: z.string().url(),
    CORS_ORIGIN: z
      .string()
      .optional()
      .transform((v) =>
        (v ?? '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      ),
    ADMIN_API_KEY: z.string().optional(),
    FRONTEND_URL: z.string().url().default('http://localhost:5173'),
    SESSION_SECRET: z
      .string()
      .min(32, 'SESSION_SECRET must be at least 32 characters')
      .default('dev-session-secret-key-must-be-at-least-32-chars-long!'),
    ADMIN_BOOTSTRAP_EMAIL: z.string().email().optional(),
    ADMIN_BOOTSTRAP_PASSWORD: z.string().min(12, 'ADMIN_BOOTSTRAP_PASSWORD must be at least 12 characters').optional(),
    LOG_LEVEL: z.string().optional(),
    SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  })
  .refine(
    (data) => {
      // Production fail-closed: CORS_ORIGIN must be explicitly configured
      if (data.NODE_ENV === 'production') {
        return Array.isArray(data.CORS_ORIGIN) && data.CORS_ORIGIN.length > 0;
      }
      return true;
    },
    {
      message: 'CORS_ORIGIN is required in production and must contain at least one valid origin URL',
      path: ['CORS_ORIGIN'],
    }
  )
  .refine(
    (data) => {
      // Production security: enforce non-placeholder session secret
      if (data.NODE_ENV === 'production') {
        return (
          data.SESSION_SECRET &&
          !data.SESSION_SECRET.includes('dev-session-secret')
        );
      }
      return true;
    },
    {
      message: 'SESSION_SECRET must be configured with a secure unique secret in production',
      path: ['SESSION_SECRET'],
    }
  )
  .refine(
    (data) => {
      // Production security: enforce non-placeholder ADMIN_API_KEY if supplied
      if (data.NODE_ENV === 'production' && data.ADMIN_API_KEY) {
        return (
          data.ADMIN_API_KEY !== 'replace_in_secret_manager' &&
          data.ADMIN_API_KEY.length >= 32
        );
      }
      return true;
    },
    {
      message:
        'ADMIN_API_KEY must not be the placeholder "replace_in_secret_manager" and must be at least 32 characters in production',
      path: ['ADMIN_API_KEY'],
    }
  );

export type Env = z.infer<typeof envSchema>;

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables configuration:');
  console.error(JSON.stringify(parsedEnv.error.format(), null, 2));
  process.exit(1);
}

export const env: Env = parsedEnv.data;
