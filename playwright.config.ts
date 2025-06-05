import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { headless: true },
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: true,
  },
  // Limit to Chromium to avoid large browser downloads in CI
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
