import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/.env.e2e' });

export default defineConfig({
    testDir: './tests',
    use: { baseURL: 'http://localhost:3000' },
    globalSetup: require.resolve('./globalSetup.ts'),
}); 