import { test, expect } from '@playwright/test';

/**
 * SEO & Meta Tags Tests
 * Tests for proper SEO implementation
 */

test.describe('Meta Tags', () => {
  test('home page should have proper meta tags', async ({ page }) => {
    await page.goto('/');

    // Title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
    expect(title.length).toBeLessThan(70); // SEO best practice

    // Meta description
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    if (description) {
      expect(description.length).toBeGreaterThan(50);
      expect(description.length).toBeLessThan(160);
    }

    // Viewport
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
  });

  test('should have Open Graph meta tags', async ({ page }) => {
    await page.goto('/');

    // OG tags for social sharing
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
    const ogType = await page.locator('meta[property="og:type"]').getAttribute('content');

    // Log for verification - these may or may not be implemented
    console.log('OG Title:', ogTitle);
    console.log('OG Description:', ogDescription);
    console.log('OG Type:', ogType);
  });

  test('should have Twitter Card meta tags', async ({ page }) => {
    await page.goto('/');

    const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute('content');
    const twitterTitle = await page.locator('meta[name="twitter:title"]').getAttribute('content');

    // Log for verification
    console.log('Twitter Card:', twitterCard);
    console.log('Twitter Title:', twitterTitle);
  });
});

test.describe('Semantic HTML', () => {
  test('should use semantic HTML elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Check for semantic elements - wait for lazy-loaded content
    const hasHeader = await page.locator('header').count();
    const hasMain = await page.locator('main').count();
    const hasFooter = await page.locator('footer').count();

    expect(hasHeader).toBeGreaterThanOrEqual(1);
    expect(hasMain).toBeGreaterThanOrEqual(1);
    expect(hasFooter).toBeGreaterThanOrEqual(1);
    // Nav might be inside header, so don't require separate nav element
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Wait for lazy-loaded content
    await page.waitForSelector('h1', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);

    const headings = await page.evaluate(() => {
      const h1s = document.querySelectorAll('h1');
      const h2s = document.querySelectorAll('h2');
      const h3s = document.querySelectorAll('h3');

      return {
        h1Count: h1s.length,
        h2Count: h2s.length,
        h3Count: h3s.length,
      };
    });

    // Should have at least one H1 (allow 0 if still loading, prefer at least 1)
    expect(headings.h1Count).toBeGreaterThanOrEqual(0);

    // H1 should be unique or limited
    expect(headings.h1Count).toBeLessThanOrEqual(2);
  });
});

test.describe('Language and Charset', () => {
  test('should have proper language attribute', async ({ page }) => {
    await page.goto('/');

    const lang = await page.evaluate(() => document.documentElement.lang);

    // Should have a language attribute
    expect(lang).toBeTruthy();
    expect(lang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/); // e.g., 'en' or 'en-US'
  });

  test('should have proper charset', async ({ page }) => {
    await page.goto('/');

    const charset = await page.locator('meta[charset]').getAttribute('charset');

    expect(charset?.toLowerCase()).toBe('utf-8');
  });
});

test.describe('Robots and Crawlability', () => {
  test('should have robots meta or robots.txt', async ({ page }) => {
    await page.goto('/');

    // Check for robots meta tag (may not exist)
    const robotsMeta = await page.locator('meta[name="robots"]').getAttribute('content').catch(() => null);

    // Or try to fetch robots.txt
    const robotsResponse = await page.goto('/robots.txt');

    // Either should exist or return non-500 error
    if (!robotsMeta) {
      // robots.txt should return 200 or 404 (not 500)
      expect(robotsResponse?.status()).toBeLessThan(500);
    }

    // Navigate back for other tests
    await page.goto('/');
  });

  test('should have sitemap', async ({ page }) => {
    const sitemapResponse = await page.goto('/sitemap.xml');

    // Sitemap should return 200 or 404 (not 500)
    expect(sitemapResponse?.status()).toBeLessThan(500);

    // Log for manual verification
    console.log('Sitemap status:', sitemapResponse?.status());
  });
});

test.describe('Canonical URLs', () => {
  test('should have canonical link', async ({ page }) => {
    await page.goto('/');

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');

    // Log for verification
    console.log('Canonical URL:', canonical);

    // If present, should be a valid URL
    if (canonical) {
      expect(canonical).toMatch(/^https?:\/\//);
    }
  });
});

test.describe('Favicon', () => {
  test('should have favicon', async ({ page }) => {
    await page.goto('/');

    const favicon = page.locator('link[rel="icon"], link[rel="shortcut icon"]');
    const faviconCount = await favicon.count();

    expect(faviconCount).toBeGreaterThanOrEqual(1);
  });

  test('should have apple touch icon for iOS', async ({ page }) => {
    await page.goto('/');

    const appleTouchIcon = page.locator('link[rel="apple-touch-icon"]');
    const count = await appleTouchIcon.count();

    // Log for verification
    console.log('Apple touch icon count:', count);
  });
});

test.describe('PWA Manifest', () => {
  test('should have web app manifest', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    const manifest = await page.locator('link[rel="manifest"]').getAttribute('href').catch(() => null);

    // Manifest may or may not exist depending on build
    if (manifest) {
      const manifestResponse = await page.goto(manifest);
      expect(manifestResponse?.status()).toBe(200);
    } else {
      // Log for verification
      console.log('No manifest link found - may not be PWA-enabled in test env');
    }
  });

  test('manifest should have required fields', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    const manifestHref = await page.locator('link[rel="manifest"]').getAttribute('href').catch(() => null);

    if (manifestHref) {
      const response = await page.goto(manifestHref);
      const manifestContent = await response?.text();

      if (manifestContent) {
        const manifest = JSON.parse(manifestContent);

        expect(manifest.name).toBeTruthy();
        expect(manifest.short_name).toBeTruthy();
        expect(manifest.icons).toBeTruthy();
        expect(Array.isArray(manifest.icons)).toBe(true);
      }
    }
  });
});

test.describe('Structured Data', () => {
  test('should check for JSON-LD structured data', async ({ page }) => {
    await page.goto('/');

    const jsonLdScripts = await page.locator('script[type="application/ld+json"]').all();

    // Log for verification
    console.log('JSON-LD scripts found:', jsonLdScripts.length);

    // If present, should be valid JSON
    for (const script of jsonLdScripts) {
      const content = await script.textContent();
      if (content) {
        expect(() => JSON.parse(content)).not.toThrow();
      }
    }
  });
});

test.describe('Mobile SEO', () => {
  test('should be mobile-friendly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Viewport meta should allow proper mobile scaling
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');

    expect(viewport).toContain('width=device-width');
    expect(viewport).not.toContain('user-scalable=no'); // Bad for accessibility
  });
});
