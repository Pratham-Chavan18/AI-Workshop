import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url().default(
    process.env.NODE_ENV === 'test'
      ? 'postgresql://postgres:postgres@localhost:5432/test_db'
      : (undefined as unknown as string)
  ),
  CORS_ORIGIN: z.string().optional(),
  ADMIN_API_KEY: z.string().optional(),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  LOG_LEVEL: z.string().optional(),
  SHUTDOWN_TIMEOUT_MS: z.coerce.number().default(10000),
});

export type Env = z.infer<typeof envSchema>;

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables configuration:');
  console.error(JSON.stringify(parsedEnv.error.format(), null, 2));
  process.exit(1);
}

export const env: Env = parsedEnv.data;
