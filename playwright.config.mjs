import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  timeout: 90_000,
  globalTimeout: 12 * 60_000,
  expect: { timeout: 15_000 },
  workers: 2,
  retries: 1,
  reporter: [['list'], ['json', { outputFile: 'results.json' }]],
  use: { browserName: 'chromium', actionTimeout: 15_000, navigationTimeout: 45_000,
    serviceWorkers: 'block', screenshot: 'only-on-failure', trace: 'off' },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
});
