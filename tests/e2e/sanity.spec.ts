import { test, expect } from '@playwright/test';

test.describe('RobuxMinerPro E2E Production Sanity', () => {

  test('Homepage loads and displays critical elements', async ({ page }) => {
    await page.goto('/');

    // Check Title
    await expect(page).toHaveTitle(/RobuxMinerPro/);

    // Check Hero Section
    const heroHeading = page.getByRole('heading', { name: 'RobuxMinerPro' });
    await expect(heroHeading).toBeVisible();

    // Check "Get Rich" CTA
    const ctaButton = page.locator('button', { hasText: 'Get Started' }).first();
    await expect(ctaButton).toBeVisible();
  });

  test('Navigation to Features page', async ({ page }) => {
    await page.goto('/');

    // Click "Learn More" or scroll to features
    // We'll try direct navigation first for stability
    await page.goto('/features');

    // Check for Features content
    // Based on src/pages/Features.tsx, the header is "Powerful Features"
    await expect(page.getByRole('heading', { name: 'Powerful Features' })).toBeVisible();
  });

  test('Lead Capture Modal opens on CTA click', async ({ page }) => {
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    await page.goto('/');

    // Click the "GET RICH" button.
    const ctaButton = page.getByRole('button', { name: 'Get Started' }).first();
    await expect(ctaButton).toBeVisible();
    await ctaButton.click({ force: true });

    // Wait for the dialog to appear.
    // If it fails, we'll see console logs.
    // Use text selector as role 'dialog' might be tricky with Radix portals in some contexts,
    // though Playwright usually handles it.
    // Use .first() to handle potential strict mode violations if the component is rendered multiple times (e.g. strict mode or multiple providers)
    await expect(page.getByText('Start earning Robux legitimately').first()).toBeVisible();
  });

  test('Auth Guard redirects unauthenticated users', async ({ page }) => {
    // Try to access a protected route
    await page.goto('/dashboard');

    // Should be redirected to /auth
    await expect(page).toHaveURL(/\/auth/);
    await expect(page.getByText('Welcome Back')).toBeVisible();
  });

  test('Health check endpoint returns operational status', async ({ page }) => {
    await page.goto('/health');
    await expect(page.getByText('System Health')).toBeVisible();
    // Use exact match to avoid strict mode violation with multiple "ok" texts
    await expect(page.getByText('ok', { exact: true })).toBeVisible();
  });

  test('Squads route is protected and redirects to auth', async ({ page }) => {
    await page.goto('/squads');
    await expect(page).toHaveURL(/\/auth/);
  });

  test('Events route is protected and redirects to auth', async ({ page }) => {
    await page.goto('/events');
    await expect(page).toHaveURL(/\/auth/);
  });

});
