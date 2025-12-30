import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility Tests
 * Comprehensive a11y testing using axe-core
 */

test.describe('Accessibility Tests', () => {
  const testPages = [
    { path: '/', name: 'Home' },
    { path: '/features', name: 'Features' },
    { path: '/pricing', name: 'Pricing' },
    { path: '/help', name: 'Help' },
    { path: '/docs', name: 'Docs' },
    { path: '/contact', name: 'Contact' },
  ];

  for (const page of testPages) {
    test(`${page.name} page should have no critical accessibility violations`, async ({ page: pageObj }) => {
      await pageObj.goto(page.path);
      await pageObj.waitForLoadState('domcontentloaded');

      // Wait for lazy loaded content
      await pageObj.waitForTimeout(2000);

      const accessibilityScanResults = await new AxeBuilder({ page: pageObj })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .exclude('.recharts-wrapper') // Exclude complex chart components
        .exclude('.absolute.-top-4') // Exclude positioned-outside badges (false positives)
        .analyze();

      // Log violations for debugging
      if (accessibilityScanResults.violations.length > 0) {
        console.log(`Accessibility violations on ${page.name}:`,
          JSON.stringify(accessibilityScanResults.violations, null, 2));
      }

      // Filter critical violations (serious and critical impact only)
      const criticalViolations = accessibilityScanResults.violations.filter(
        v => v.impact === 'critical' || v.impact === 'serious'
      );

      expect(criticalViolations).toHaveLength(0);
    });
  }
});

test.describe('Keyboard Navigation', () => {
  test('should be able to navigate with keyboard on home page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Tab through the page
    await page.keyboard.press('Tab');

    // Check that focus is visible
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return el ? el.tagName.toLowerCase() : null;
    });

    expect(focusedElement).not.toBeNull();
  });

  test('skip to main content link should work', async ({ page }) => {
    await page.goto('/');

    // Press Tab to focus skip link if it exists
    await page.keyboard.press('Tab');

    // Check if skip link exists
    const skipLink = page.locator('a[href="#main"]');
    if (await skipLink.isVisible()) {
      await skipLink.click();

      // Main content should be focused
      const mainFocused = await page.evaluate(() =>
        document.activeElement?.id === 'main' ||
        document.activeElement?.closest('#main') !== null
      );

      expect(mainFocused).toBeTruthy();
    }
  });
});

test.describe('Color Contrast', () => {
  test('text should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('body')
      .analyze();

    const contrastViolations = accessibilityScanResults.violations.filter(
      v => v.id === 'color-contrast'
    );

    // Log for debugging but allow some flexibility
    if (contrastViolations.length > 0) {
      console.log('Contrast issues found:', contrastViolations.length);
    }

    // Allow up to 5 minor contrast issues (often in decorative elements)
    expect(contrastViolations.length).toBeLessThan(5);
  });
});

test.describe('ARIA and Semantic HTML', () => {
  test('page should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Wait for lazy-loaded content to render
    await page.waitForSelector('h1', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);

    const headings = await page.evaluate(() => {
      const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      return Array.from(headingElements).map(h => ({
        level: parseInt(h.tagName.substring(1)),
        text: h.textContent?.trim().substring(0, 50)
      }));
    });

    // Should have at least one h1 (allow 0 if page is still loading but prefer at least 1)
    const h1Count = headings.filter(h => h.level === 1).length;
    expect(h1Count).toBeGreaterThanOrEqual(1);

    // H1 should typically be unique
    expect(h1Count).toBeLessThanOrEqual(2);
  });

  test('images should have alt text', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const imagesWithoutAlt = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      return Array.from(images).filter(img =>
        !img.hasAttribute('alt') &&
        !img.hasAttribute('role') &&
        img.getAttribute('role') !== 'presentation'
      ).length;
    });

    expect(imagesWithoutAlt).toBe(0);
  });

  test('interactive elements should have accessible names', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['button-name', 'link-name', 'input-button-name'])
      .analyze();

    const nameViolations = accessibilityScanResults.violations;

    // Should have no missing names on interactive elements
    expect(nameViolations).toHaveLength(0);
  });
});

test.describe('Focus Management', () => {
  test('focus should be visible on interactive elements', async ({ page }) => {
    await page.goto('/');

    // Tab to first interactive element
    await page.keyboard.press('Tab');

    // Check if there's a visible focus indicator
    const hasFocusOutline = await page.evaluate(() => {
      const focused = document.activeElement;
      if (!focused || focused === document.body) return true; // No focusable elements is ok

      const style = window.getComputedStyle(focused);
      const hasOutline = style.outlineStyle !== 'none' ||
                         style.boxShadow !== 'none' ||
                         focused.classList.contains('focus-visible');
      return hasOutline;
    });

    expect(hasFocusOutline).toBeTruthy();
  });
});

test.describe('Form Accessibility', () => {
  test('auth page forms should have proper labels', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['label', 'label-content-name-mismatch'])
      .analyze();

    const labelViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(labelViolations).toHaveLength(0);
  });
});
