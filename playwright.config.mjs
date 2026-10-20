// Night Glass demo page tests: smoke (errors, overflow, main actions) and visual (screenshot comparison).
// Run: npm i && npx playwright install chromium && npm test. Update references after intentional changes: npm run test:update
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  timeout: 60_000,
  fullyParallel: true,
  workers: 3,   // long full-page screenshots don't get time to settle when many browsers run at once
  reporter: [['list']],
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}-{projectName}{ext}',
  expect: { timeout: 20_000, toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled', caret: 'hide' } },
  use: { baseURL: 'http://localhost:4399', colorScheme: 'dark' },
  webServer: { command: 'node tests/serve.mjs 4399', url: 'http://localhost:4399/demo/kit.html', reuseExistingServer: true },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['iPhone 13'], browserName: 'chromium' } },
  ],
});
