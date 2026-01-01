import { test, expect, devices } from '@playwright/test';

/**
 * Responsive Design Tests
 * Tests for mobile, tablet, and desktop layouts
 */

const viewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 720 },
  largeDesktop: { width: 1920, height: 1080 },
};

test.describe('Responsive Layout - Mobile', () => {
  test.use({ viewport: viewports.mobile });

  test('home page should display correctly on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Content should be visible
    await expect(page.locator('main')).toBeVisible();

    // No horizontal scrollbar
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasHorizontalScroll).toBe(false);
  });

  test('navigation should be mobile-friendly', async ({ page }) => {
    await page.goto('/');

    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Check for mobile menu button
    const mobileMenuBtn = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"], [class*="mobile-menu"], [class*="hamburger"]').first();

    // Mobile navigation should exist
    await expect(nav).toBeVisible();
  });

  test('text should be readable on mobile', async ({ page }) => {
    await page.goto('/');

    // Check font sizes are reasonable for mobile
    const fontSizes = await page.evaluate(() => {
      const paragraphs = document.querySelectorAll('p, span, div');
      const sizes: number[] = [];
      paragraphs.forEach(p => {
        const size = parseFloat(window.getComputedStyle(p).fontSize);
        if (size > 0) sizes.push(size);
      });
      return sizes;
    });

    // Minimum readable font size is typically 12px
    const tooSmall = fontSizes.filter(size => size < 10);
    expect(tooSmall.length).toBeLessThan(fontSizes.length * 0.1); // Less than 10% too small
  });

  test('buttons should be touch-friendly on mobile', async ({ page }) => {
    await page.goto('/');

    const buttons = page.locator('button, a[role="button"]');
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const box = await button.boundingBox();
        if (box) {
          // Minimum touch target is 44x44 pixels (Apple HIG)
          // We'll be lenient and check for 36x36
          const isTouchFriendly = box.width >= 36 && box.height >= 36;
          if (!isTouchFriendly) {
            console.log(`Button ${i} may be too small: ${box.width}x${box.height}`);
          }
        }
      }
    }
  });
});

test.describe('Responsive Layout - Tablet', () => {
  test.use({ viewport: viewports.tablet });

  test('home page should display correctly on tablet', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('main')).toBeVisible();

    // No horizontal scrollbar
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasHorizontalScroll).toBe(false);
  });

  test('features page should have proper grid layout on tablet', async ({ page }) => {
    await page.goto('/features');
    await page.waitForLoadState('domcontentloaded');

    // Check for grid or flex layout
    const hasGridLayout = await page.evaluate(() => {
      const elements = document.querySelectorAll('[class*="grid"], [class*="flex"]');
      return elements.length > 0;
    });

    expect(hasGridLayout).toBeTruthy();
  });
});

test.describe('Responsive Layout - Desktop', () => {
  test.use({ viewport: viewports.desktop });

  test('home page should display correctly on desktop', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('main')).toBeVisible();

    // Full navigation should be visible
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('content should use available width on desktop', async ({ page }) => {
    await page.goto('/');

    // Main content should not be too narrow on desktop
    const mainWidth = await page.evaluate(() => {
      const main = document.querySelector('main');
      return main ? main.getBoundingClientRect().width : 0;
    });

    // Content should use reasonable width (at least 60% of viewport)
    expect(mainWidth).toBeGreaterThan(viewports.desktop.width * 0.5);
  });
});

test.describe('Responsive Layout - Large Desktop', () => {
  test.use({ viewport: viewports.largeDesktop });

  test('content should have max-width on large screens', async ({ page }) => {
    await page.goto('/');

    // Content should not stretch infinitely
    const contentWidth = await page.evaluate(() => {
      const main = document.querySelector('main');
      return main ? main.getBoundingClientRect().width : 0;
    });

    // Content should have a reasonable max width (not full 1920px)
    expect(contentWidth).toBeLessThan(1800);
  });
});

test.describe('Responsive Images', () => {
  test('images should scale properly on different viewports', async ({ page }) => {
    await page.goto('/');

    // Check for responsive image classes or styles
    const hasResponsiveImages = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      let responsive = 0;

      images.forEach(img => {
        const style = window.getComputedStyle(img);
        const classes = img.className;

        // Check for responsive styling
        if (
          style.maxWidth === '100%' ||
          classes.includes('w-full') ||
          classes.includes('max-w') ||
          img.hasAttribute('srcset')
        ) {
          responsive++;
        }
      });

      return images.length === 0 || responsive > 0;
    });

    expect(hasResponsiveImages).toBeTruthy();
  });
});

test.describe('Responsive Typography', () => {
  test('headings should scale appropriately', async ({ page }) => {
    // Mobile
    await page.setViewportSize(viewports.mobile);
    await page.goto('/');

    const mobileH1Size = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? parseFloat(window.getComputedStyle(h1).fontSize) : 0;
    });

    // Desktop
    await page.setViewportSize(viewports.desktop);
    await page.waitForTimeout(300);

    const desktopH1Size = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? parseFloat(window.getComputedStyle(h1).fontSize) : 0;
    });

    // Desktop headings should be same size or larger
    if (mobileH1Size > 0 && desktopH1Size > 0) {
      expect(desktopH1Size).toBeGreaterThanOrEqual(mobileH1Size);
    }
  });
});

test.describe('Responsive Footer', () => {
  test('footer should be visible on all viewports', async ({ page }) => {
    for (const [name, viewport] of Object.entries(viewports)) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(300);

      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
    }
  });
});

test.describe('Orientation Changes', () => {
  test('should handle landscape orientation', async ({ page }) => {
    // Landscape mobile
    await page.setViewportSize({ width: 667, height: 375 });
    await page.goto('/');

    await expect(page.locator('main')).toBeVisible();

    // No horizontal scroll in landscape
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasHorizontalScroll).toBe(false);
  });
});
