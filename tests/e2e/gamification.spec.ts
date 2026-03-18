import { test, expect } from '@playwright/test';

test.describe('Algo-Forge Gamification Engine', () => {

  test('Persistent PiP Agent can be launched from Dashboard', async ({ page }) => {
    // Navigate via Auth Bypass
    await page.goto('/auth');
    await page.getByRole('button', { name: /APEX EMERGENCY BYPASS/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Verify PiP section exists
    const pipHeader = page.getByRole('heading', { name: /PiP Neural/i });
    await expect(pipHeader).toBeVisible();

    // Verify the launcher button exists
    const launcher = page.getByRole('button', { name: /ACTIVATE NEURAL BRIDGE/i });
    await expect(launcher).toBeVisible();
  });

  test('High-Voltage Reward Unboxing flow triggers correctly', async ({ page }) => {
    // Navigate via Auth Bypass
    await page.goto('/auth');
    await page.getByRole('button', { name: /APEX EMERGENCY BYPASS/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Simulate a reward drop via the wrapper button
    await page.getByRole('button', { name: /DEPLOY LOOT DROP/i }).click();

    // Verify the "Unlock Epic Loot" UI mounts
    await expect(page.getByText('Unlock Epic Loot')).toBeVisible();

    // Interact with the box (click the image)
    await page.locator('img[alt="Epic Loot Chest"]').click();

    // Wait for the animation to complete and verify the reward payload
    // The `CLAIM HARVEST` button appears when it is opened
    await expect(page.getByRole('button', { name: /CLAIM HARVEST/i })).toBeVisible({ timeout: 5000 });
  });

});
