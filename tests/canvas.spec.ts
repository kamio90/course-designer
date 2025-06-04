import { test, expect } from '@playwright/test';

// Basic smoke test loading the app and checking canvas exists

test('canvas loads and displays', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
});
