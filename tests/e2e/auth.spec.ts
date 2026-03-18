import { test, expect } from '@playwright/test';

test.describe('Authentication & Dashboard Flow', () => {

  test('APEX Emergency Bypass logs user in and loads Dashboard', async ({ page }) => {
    // 1. Navigate directly to the Auth page
    await page.goto('/auth');
    
    // Check if we are on the Auth page
    await expect(page).toHaveURL(/\/auth/);

    // 2. Find and click the APEX Bypass button
    const bypassButton = page.getByRole('button', { name: /APEX EMERGENCY BYPASS/i });
    await expect(bypassButton).toBeVisible();
    await bypassButton.click();

    // 3. Verify redirection to Dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // 4. Validate Dashboard UI (State Persistence & Hook optimizations)
    // The "ALGO-FORGE CORE" text from Dashboard
    const welcomeHeader = page.getByRole('heading', { name: /ALGO‑FORGE CORE/i });
    await expect(welcomeHeader).toBeVisible({ timeout: 10000 });

    // The StatCards should become visible immediately 
    await expect(page.getByText(/Liquid Assets/i).first()).toBeVisible();
    await expect(page.getByText(/Mining Rate/i).first()).toBeVisible();
  });

});
