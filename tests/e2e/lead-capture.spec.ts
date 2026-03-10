import { test, expect } from '@playwright/test';

test.describe('Lead Capture Modal', () => {
  test('should successfully submit lead and show success message', async ({ page }) => {
    // Intercept the network request to the leads endpoint
    await page.route('**/*', async (route) => {
      if (route.request().method() === 'POST' && route.request().url().includes('mock-leads-endpoint.com')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      } else {
        await route.continue();
      }
    });

    // Navigate to home page
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('domcontentloaded');

    // Open the LeadCaptureModal
    const ctaButton = page.locator('button:has(.lucide-rocket)').first();
    await expect(ctaButton).toBeVisible();
    await ctaButton.click();

    // Wait for the modal to be visible
    const modal = page.locator('[role="dialog"]').first();
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('legitimately');

    // Fill the email input
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill('test@example.com');

    // Check the consent checkbox
    const consentCheckbox = page.locator('button[role="checkbox"], input[type="checkbox"]').first();
    await consentCheckbox.click();

    // Verify it is enabled
    const submitButton = page.locator('button[type="submit"]').first();
    await expect(submitButton).toBeEnabled();

    // Click the submit button
    await submitButton.click();

    // Verify the success state
    await expect(modal).toContainText('Check your inbox');
  });

  test('submit button should be disabled if form is incomplete', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');

    // Open the LeadCaptureModal
    await page.locator('button:has(.lucide-rocket)').first().click();

    const modal = page.locator('[role="dialog"]').first();
    await expect(modal).toBeVisible();

    const submitButton = page.locator('button[type="submit"]').first();

    // Initially disabled
    await expect(submitButton).toBeDisabled();

    // Fill email but no consent
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill('test@example.com');
    await expect(submitButton).toBeDisabled();

    // Clear email, check consent
    await emailInput.clear();
    const consentCheckbox = page.locator('button[role="checkbox"], input[type="checkbox"]').first();
    await consentCheckbox.click();
    await expect(submitButton).toBeDisabled();

    // Both filled -> enabled
    await emailInput.fill('test@example.com');
    await expect(submitButton).toBeEnabled();
  });
});
