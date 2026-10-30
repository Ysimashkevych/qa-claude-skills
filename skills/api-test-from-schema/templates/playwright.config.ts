import { defineConfig } from '@playwright/test';

const baseURL = process.env.API_BASE_URL;
if (!baseURL) throw new Error('API_BASE_URL is required (no default, to avoid hitting a real host)');

export default defineConfig({
  testDir: './tests/api',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    extraHTTPHeaders: {
      Accept: 'application/json',
      ...(process.env.API_TOKEN ? { Authorization: `Bearer ${process.env.API_TOKEN}` } : {}),
    },
  },
});
