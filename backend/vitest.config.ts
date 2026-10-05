import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(__dirname, '.env.test'), override: true });

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 30000,
    hookTimeout: 30000,
    sequence: {
      concurrent: false,
    },
  },
});
