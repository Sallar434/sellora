import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { globalSetup: './tests/setup.ts', env: { DATABASE_URL: 'file:./test.db', NODE_ENV: 'test', ESCROW_AUTO_RELEASE_DAYS: '7' }, fileParallelism: false, testTimeout: 30000, hookTimeout: 60000 } });
