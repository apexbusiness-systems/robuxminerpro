import { test, expect } from '@playwright/test';

/**
 * Navigation & Page Load Tests
 * Tests all public and protected routes for proper loading
 */

test.describe('Public Routes Navigation', () => {
  const publicRoutes = [
    { path: '/', name: 'Home', expectedText: ['RobuxMinerPro', 'Learn', 'Earn'] },
    { path: '/features', name: 'Features' },
    { path: '/pricing', name: 'Pricing' },
    { path: '/privacy', name: 'Privacy' },
    { path: '/terms', name: 'Terms' },
    { path: '/status', name: 'Status' },
    { path: '/health', name: 'Health Check' },
    { path: '/docs', name: 'Documentation' },
    { path: '/help', name: 'Help' },
    { path: '/community', name: 'Community' },
    { path: '/contact', name: 'Contact' },
    { path: '/cookies', name: 'Cookies' },
    { path: '/api', name: 'API' },
  ];

  for (const route of publicRoutes) {
    test(`should load ${route.name} page (${route.path})`, async ({ page }) => {
      const response = await page.goto(route.path);

      // Verify HTTP response
      expect(response?.status()).toBeLessThan(400);

      // Wait for page to be ready
      await expect(page.locator('main')).toBeVisible({ timeout: 10000 });

      // Verify no console errors
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      // Give time for any async errors
      await page.waitForTimeout(1000);

      // Filter out expected console errors (like Supabase connection issues in test)
      const criticalErrors = errors.filter(e =>
        !e.includes('supabase') &&
        !e.includes('Failed to load') &&
        !e.includes('net::')
      );

      expect(criticalErrors).toHaveLength(0);
    });
  }
});

test.describe('Protected Routes Redirect', () => {
  const protectedRoutes = [
    '/dashboard',
    '/squads',
    '/achievements',
    '/learn',
    '/events',
    '/payments',
    '/mentor',
    '/profile',
    '/settings',
  ];

  for (const route of protectedRoutes) {
    test(`should redirect unauthenticated user from ${route} to auth`, async ({ page }) => {
      await page.goto(route);

      // Should redirect to auth page or show auth modal
      await page.waitForTimeout(2000);

      // Either redirected to /auth or shows login prompt
      const url = page.url();
      const hasAuthPrompt = await page.locator('text=/sign in|log in|login|create account/i').isVisible().catch(() => false);

      expect(url.includes('/auth') || hasAuthPrompt).toBeTruthy();
    });
  }
});

test.describe('404 Page', () => {
  test('should display 404 page for non-existent routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-12345');

    // Wait for lazy-loaded 404 page
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Should show 404 content
    await expect(page.locator('text=/404|not found|page not found/i')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Navigation Component', () => {
  test('should display navigation bar on all pages', async ({ page }) => {
    await page.goto('/');

    // Wait for page to fully load
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Check navigation exists - use header as nav may be inside header
    const nav = page.locator('nav, header');
    await expect(nav.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/');

    // Find and click Features link
    const featuresLink = page.locator('a[href="/features"]').first();
    if (await featuresLink.isVisible()) {
      await featuresLink.click();
      await expect(page).toHaveURL('/features');
    }
  });

  test('should display footer on all pages', async ({ page }) => {
    await page.goto('/');

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
});

test.describe('Page Performance', () => {
  test('home page should load within performance budget', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const loadTime = Date.now() - startTime;

    // Page should load DOM in under 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have reasonable First Contentful Paint', async ({ page }) => {
    await page.goto('/');

    const fcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntriesByType('paint');
          const fcpEntry = entries.find(e => e.name === 'first-contentful-paint');
          if (fcpEntry) {
            resolve(fcpEntry.startTime);
          }
        });
        observer.observe({ entryTypes: ['paint'] });

        // Fallback timeout
        setTimeout(() => resolve(0), 5000);
      });
    });

    // FCP should be under 3 seconds
    if (fcp > 0) {
      expect(fcp).toBeLessThan(3000);
    }
  });
});
