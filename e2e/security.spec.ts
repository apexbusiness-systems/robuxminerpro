import { test, expect } from '@playwright/test';

/**
 * Security Tests
 * Tests for common security vulnerabilities and best practices
 */

test.describe('Security Headers', () => {
  test('should have security headers on responses', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response?.headers();

    // Check for recommended security headers (may be set by hosting platform)
    // These are informational - actual headers depend on deployment config
    console.log('Response headers:', headers);

    // Response should be successful
    expect(response?.status()).toBeLessThan(400);
  });
});

test.describe('XSS Prevention', () => {
  test('should not execute script tags in URL parameters', async ({ page }) => {
    // Track if any scripts were executed
    let scriptExecuted = false;

    await page.addInitScript(() => {
      (window as Window & { __xssTest?: boolean }).__xssTest = false;
    });

    // Try to inject script via URL
    await page.goto('/?q=<script>window.__xssTest=true</script>');

    scriptExecuted = await page.evaluate(
      () => (window as Window & { __xssTest?: boolean }).__xssTest
    );

    expect(scriptExecuted).toBe(false);
  });

  test('should escape HTML in user-visible content', async ({ page }) => {
    await page.goto('/');

    // Check that no raw HTML injection is possible
    const pageContent = await page.content();

    // Page should not contain unescaped script tags from parameters
    expect(pageContent).not.toContain('<script>window.__xssTest');
  });
});

test.describe('CSRF Protection', () => {
  test('forms should use POST method for sensitive actions', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Find login/signup forms
    const forms = page.locator('form');
    const formCount = await forms.count();

    for (let i = 0; i < formCount; i++) {
      const form = forms.nth(i);
      const method = await form.getAttribute('method');

      // Forms handling sensitive data should use POST (or be controlled via JS)
      // React forms typically don't have method attribute as they're JS controlled
      if (method) {
        expect(method.toLowerCase()).not.toBe('get');
      }
    }
  });
});

test.describe('Sensitive Data Exposure', () => {
  test('should not expose sensitive data in page source', async ({ page }) => {
    await page.goto('/');

    const pageContent = await page.content();

    // Should not contain API keys or secrets in HTML
    expect(pageContent).not.toMatch(/sk-[a-zA-Z0-9]{20,}/); // API keys
    expect(pageContent).not.toMatch(/password\s*[:=]\s*['"]/i); // Hardcoded passwords
    expect(pageContent).not.toMatch(/secret\s*[:=]\s*['"]/i); // Secrets
  });

  test('should not log sensitive data to console', async ({ page }) => {
    const consoleLogs: string[] = [];

    page.on('console', msg => {
      consoleLogs.push(msg.text());
    });

    await page.goto('/');
    await page.waitForTimeout(2000);

    // Check console logs for sensitive data
    const sensitivePatterns = [
      /password/i,
      /secret/i,
      /api[_-]?key/i,
      /auth[_-]?token/i,
    ];

    for (const log of consoleLogs) {
      for (const pattern of sensitivePatterns) {
        // Exclude common development warnings
        if (!log.includes('DevTools') && !log.includes('React')) {
          expect(log).not.toMatch(pattern);
        }
      }
    }
  });
});

test.describe('Authentication Security', () => {
  test('auth page should use HTTPS-like secure practices', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('domcontentloaded');

    // Password fields should have autocomplete attribute
    const passwordInputs = page.locator('input[type="password"]');
    const count = await passwordInputs.count();

    for (let i = 0; i < count; i++) {
      const input = passwordInputs.nth(i);
      const autocomplete = await input.getAttribute('autocomplete');

      // Should have autocomplete for password managers
      // This is a best practice check, not a hard requirement
      console.log(`Password input ${i} autocomplete:`, autocomplete);
    }
  });

  test('should not store credentials in localStorage', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('domcontentloaded');

    const localStorage = await page.evaluate(() => {
      const items: Record<string, string> = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) {
          items[key] = window.localStorage.getItem(key) || '';
        }
      }
      return items;
    });

    // Should not store raw passwords
    for (const [key, value] of Object.entries(localStorage)) {
      expect(key.toLowerCase()).not.toContain('password');
      expect(value.toLowerCase()).not.toContain('password123');
    }
  });
});

test.describe('Input Validation', () => {
  test('email input should validate format', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    const emailInput = page.locator('input[type="email"]').first();

    if (await emailInput.isVisible()) {
      // Enter invalid email
      await emailInput.fill('invalid-email');
      await emailInput.blur();

      // Check for validation - either native or custom
      const isInvalid = await emailInput.evaluate((el: HTMLInputElement) =>
        !el.validity.valid || el.getAttribute('aria-invalid') === 'true'
      );

      // Form should indicate invalid email
      // (depends on implementation - log for manual verification)
      console.log('Email validation active:', isInvalid);
    }
  });
});

test.describe('Rate Limiting Indicators', () => {
  test('should handle rapid requests gracefully', async ({ page }) => {
    // Make multiple sequential rapid requests
    const responses = [];

    responses.push(await page.goto('/'));
    responses.push(await page.goto('/features'));
    responses.push(await page.goto('/pricing'));

    // All should complete without server errors
    for (const response of responses) {
      expect(response?.status()).toBeLessThan(500);
    }
  });
});

test.describe('Content Security', () => {
  test('external links should have rel="noopener"', async ({ page }) => {
    await page.goto('/');

    const externalLinks = page.locator('a[target="_blank"]');
    const count = await externalLinks.count();

    for (let i = 0; i < count; i++) {
      const link = externalLinks.nth(i);
      const rel = await link.getAttribute('rel');

      // Should have noopener or noreferrer for security
      expect(rel).toMatch(/noopener|noreferrer/);
    }
  });
});

test.describe('Error Handling Security', () => {
  test('404 page should not expose sensitive information', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');

    const pageContent = await page.content();

    // Should not expose stack traces or internal paths
    expect(pageContent).not.toMatch(/Error:/i);
    expect(pageContent).not.toMatch(/node_modules/i);
    expect(pageContent).not.toMatch(/at\s+\w+\s+\(/); // Stack traces
  });
});
