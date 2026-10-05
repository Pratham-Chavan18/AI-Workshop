import { config } from 'dotenv';
import path from 'path';

// Pre-load .env.test before any application modules are evaluated during test execution
config({ path: path.resolve(__dirname, '../../.env.test') });
