import { defineConfig, devices } from '@playwright/test';

/**
 * High Tide QA automation.
 * SITE_URL selects the store under test (default: Smoke Cartel live site, read-only checks only).
 * Rules (QA Test Strategy, sections 6 and 15): no orders, no payments, no account changes on production.
 */
const SITE_URL = process.env.SITE_URL || 'https://www.smokecartel.com';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,          // be gentle with live stores
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }], ['json', { outputFile: 'test-results/results.json' }]],
  use: {
    baseURL: SITE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    userAgent: 'HighTide-QA-Automation/0.1 (+internal QA smoke tests)',
  },
  projects: [
    { name: 'api', testDir: './tests/api' },
    { name: 'desktop-chrome', testDir: './tests/frontend', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', testDir: './tests/frontend', use: { ...devices['Pixel 7'] } },
  ],
});
