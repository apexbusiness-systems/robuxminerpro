import { Page, expect } from '@playwright/test';

/**
 * Logs in using the Dev Bypass button on the auth page.
 * @param page Playwright page object
 */
export async function loginViaBypass(page: Page) {
  await page.goto('/auth');

  // Wait for the auth page to load
  await expect(page.getByText('RobuxMinerPro')).toBeVisible();

  // Click the bypass button
  const bypassButton = page.getByRole('button', { name: /APEX EMERGENCY BYPASS/i });
  await expect(bypassButton).toBeVisible();
  await bypassButton.click();

  // Wait for redirect to dashboard
  await expect(page).toHaveURL(/\/dashboard/);
}
