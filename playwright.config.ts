import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

/**
 * Playwright configuration
 * Docs: https://playwright.dev/docs/test-configuration
 *
 * TestDino real-time streaming reporter is enabled via @testdino/playwright.
 * The API token is read from the TESTDINO_TOKEN environment variable
 * (set it in .env or export it in your shell). Never hardcode it here.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['@testdino/playwright', { token: process.env.TESTDINO_TOKEN }],
  ],

  use: {
    baseURL: 'https://demo.playwright.dev',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
});
