import { test, expect } from '@playwright/test';

test('bypassMockLogin is not callable in production build', async ({ page }) => {
  await page.goto('/');
  const hasBypassButton = await page.locator('[data-testid="bypass-mock-login"]').count();
  expect(hasBypassButton).toBe(0);
});

test('auth page redirects unauthenticated users', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/auth/);
});
