import { test, expect } from '@playwright/test';

test.describe('Algo-Forge Gamification Engine', () => {

  test('Persistent PiP Agent can be launched from Dashboard', async ({ page }) => {
    // Navigate to Dashboard (requires auth in a real app, assuming a test route or mocked auth here)
    // For the sake of the E2E verification, we'll navigate directly to a page rendering the component
    // Assuming the app is running locally on port 5173
    await page.goto('http://localhost:5173/dashboard');

    // Wait for the PiP launch button
    const launcher = page.getByRole('button', { name: /Launch APEX PiP Companion/i });
    
    // In Chromium, we can't easily mock the native DPIP window opening from pure Playwright
    // without specific browser flags, but we CAN verify the button exists and triggers the API
    await expect(launcher).toBeVisible();

    // Since DPIP is a native OS window, full E2E testing of the *window* itself 
    // is outside the DOM scope of the main page. We verify the wrapper state changes.
    await launcher.click();
    
    // Once clicked, the launcher should disappear and be replaced by the PiP Agent
    await expect(launcher).toBeHidden();
  });

  test('High-Voltage Reward Unboxing flow triggers correctly', async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('http://localhost:8080/dashboard');
    
    // Simulate a reward drop via the wrapper button
    await page.getByRole('button', { name: /Simulate Reward Drop/i }).click();

    // Verify the "Tap to Unbox" UI mounts
    await expect(page.getByText('Tap to Unbox')).toBeVisible();

    // Interact with the box
    await page.locator('.lucide-package-open').locator('..').click(); // click the box container

    // Verify it transitions to unlocking state
    await expect(page.getByText('Unlocking...')).toBeVisible();
    
    // Wait for the animation to complete and verify the reward payload
    await expect(page.getByText('Bonus XP Secured')).toBeVisible({ timeout: 2000 });
  });

});
