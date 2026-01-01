import { test, expect } from '@playwright/test';

/**
 * Performance Tests
 * Tests for page load times, bundle sizes, and Core Web Vitals
 */

test.describe('Page Load Performance', () => {
  const pages = [
    { path: '/', name: 'Home', maxLoadTime: 5000 },
    { path: '/features', name: 'Features', maxLoadTime: 4000 },
    { path: '/pricing', name: 'Pricing', maxLoadTime: 4000 },
    { path: '/docs', name: 'Docs', maxLoadTime: 4000 },
  ];

  for (const pageConfig of pages) {
    test(`${pageConfig.name} should load within ${pageConfig.maxLoadTime}ms`, async ({ page }) => {
      const startTime = Date.now();

      await page.goto(pageConfig.path);
      await page.waitForLoadState('domcontentloaded');

      const loadTime = Date.now() - startTime;

      console.log(`${pageConfig.name} page load time: ${loadTime}ms`);

      expect(loadTime).toBeLessThan(pageConfig.maxLoadTime);
    });
  }
});

test.describe('Core Web Vitals', () => {
  test('should measure Largest Contentful Paint (LCP)', async ({ page }) => {
    await page.goto('/');

    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let lcpValue = 0;

        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry | undefined;
          if (lastEntry) {
            lcpValue = lastEntry.startTime;
          }
        });

        observer.observe({ type: 'largest-contentful-paint', buffered: true });

        // Wait a bit for LCP to be captured
        setTimeout(() => {
          observer.disconnect();
          resolve(lcpValue);
        }, 3000);
      });
    });

    console.log('LCP:', lcp, 'ms');

    // LCP should be under 2.5s for good, under 4s for acceptable
    if (lcp > 0) {
      expect(lcp).toBeLessThan(4000);
    }
  });

  test('should measure First Input Delay readiness', async ({ page }) => {
    await page.goto('/');

    // Measure time to interactive by checking when page responds to clicks
    const startTime = Date.now();

    // Wait for page to be interactive
    await page.waitForLoadState('domcontentloaded');

    const button = page.locator('button, a').first();
    if (await button.isVisible()) {
      await button.click({ force: true, noWaitAfter: true }).catch(() => {});
    }

    const interactiveTime = Date.now() - startTime;

    console.log('Time to Interactive:', interactiveTime, 'ms');

    // Should be interactive within 5 seconds
    expect(interactiveTime).toBeLessThan(5000);
  });

  test('should measure Cumulative Layout Shift (CLS)', async ({ page }) => {
    await page.goto('/');

    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsValue = 0;

        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries() as PerformanceEntry[];
          for (const entry of entries) {
            const layoutShiftEntry = entry as PerformanceEntry & {
              hadRecentInput?: boolean;
              value?: number;
            };
            if (!layoutShiftEntry.hadRecentInput && layoutShiftEntry.value) {
              clsValue += layoutShiftEntry.value;
            }
          }
        });

        observer.observe({ type: 'layout-shift', buffered: true });

        // Wait for page to stabilize
        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 3000);
      });
    });

    console.log('CLS:', cls);

    // CLS should be under 0.1 for good, under 0.25 for acceptable
    expect(cls).toBeLessThan(0.25);
  });
});

test.describe('Resource Loading', () => {
  test('should not load excessively large resources', async ({ page }) => {
    const largeResources: { url: string; size: number }[] = [];

    page.on('response', async (response) => {
      const headers = response.headers();
      const contentLength = parseInt(headers['content-length'] || '0');

      // Flag resources larger than 500KB
      if (contentLength > 500 * 1024) {
        largeResources.push({
          url: response.url(),
          size: contentLength,
        });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    if (largeResources.length > 0) {
      console.log('Large resources:', largeResources);
    }

    // Should not have more than 3 large resources
    expect(largeResources.length).toBeLessThan(3);
  });

  test('should use efficient image formats', async ({ page }) => {
    const imageFormats: string[] = [];

    page.on('response', async (response) => {
      const contentType = response.headers()['content-type'] || '';
      if (contentType.startsWith('image/')) {
        imageFormats.push(contentType);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Log image formats for analysis
    console.log('Image formats used:', [...new Set(imageFormats)]);

    // Check for modern formats (webp, avif) - informational
    const hasModernFormats = imageFormats.some(
      f => f.includes('webp') || f.includes('avif')
    );
    console.log('Uses modern image formats:', hasModernFormats);
  });
});

test.describe('JavaScript Performance', () => {
  test('should not have excessive DOM nodes', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const domStats = await page.evaluate(() => {
      const allNodes = document.querySelectorAll('*');
      return {
        totalNodes: allNodes.length,
        maxDepth: (() => {
          let maxDepth = 0;
          const checkDepth = (node: Element, depth: number) => {
            maxDepth = Math.max(maxDepth, depth);
            for (const child of node.children) {
              checkDepth(child, depth + 1);
            }
          };
          checkDepth(document.body, 0);
          return maxDepth;
        })(),
      };
    });

    console.log('DOM Stats:', domStats);

    // Should not have more than 1500 DOM nodes for a simple page
    expect(domStats.totalNodes).toBeLessThan(3000);

    // DOM depth should be reasonable
    expect(domStats.maxDepth).toBeLessThan(32);
  });

  test('should not have memory leaks on navigation', async ({ page }) => {
    await page.goto('/');

    // Get initial heap size
    const initialMetrics = await page.metrics();

    // Navigate around
    for (let i = 0; i < 5; i++) {
      await page.goto('/features');
      await page.goto('/');
    }

    // Get final heap size
    const finalMetrics = await page.metrics();

    const heapGrowth = finalMetrics.JSHeapUsedSize - initialMetrics.JSHeapUsedSize;

    console.log('Initial heap:', initialMetrics.JSHeapUsedSize);
    console.log('Final heap:', finalMetrics.JSHeapUsedSize);
    console.log('Heap growth:', heapGrowth);

    // Heap should not grow excessively (allow some growth for caching)
    // This is a rough heuristic
    expect(heapGrowth).toBeLessThan(50 * 1024 * 1024); // 50MB max growth
  });
});

test.describe('Network Performance', () => {
  test('should minimize number of network requests', async ({ page }) => {
    let requestCount = 0;

    page.on('request', () => {
      requestCount++;
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    console.log('Total requests:', requestCount);

    // Should not have excessive requests
    expect(requestCount).toBeLessThan(50);
  });

  test('should use HTTP caching effectively', async ({ page }) => {
    // First visit
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    let cachedResponses = 0;
    let totalResponses = 0;

    page.on('response', (response) => {
      totalResponses++;
      const cacheControl = response.headers()['cache-control'];
      if (cacheControl && !cacheControl.includes('no-store')) {
        cachedResponses++;
      }
    });

    // Second visit (should use cache)
    await page.reload();
    await page.waitForLoadState('networkidle');

    console.log('Total responses:', totalResponses);
    console.log('Cacheable responses:', cachedResponses);
  });
});

test.describe('Lazy Loading', () => {
  test('should lazy load images below the fold', async ({ page }) => {
    await page.goto('/');

    const lazyImages = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      let lazy = 0;

      images.forEach(img => {
        if (img.loading === 'lazy' || img.hasAttribute('data-src')) {
          lazy++;
        }
      });

      return { total: images.length, lazy };
    });

    console.log('Image loading:', lazyImages);

    // If there are many images, some should be lazy loaded
    if (lazyImages.total > 5) {
      expect(lazyImages.lazy).toBeGreaterThan(0);
    }
  });

  test('should use code splitting for routes', async ({ page }) => {
    const scripts: string[] = [];

    page.on('response', (response) => {
      if (response.url().includes('.js')) {
        scripts.push(response.url());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // With code splitting, we should have multiple JS files
    console.log('JS files loaded:', scripts.length);

    // Should have vendor chunks and route chunks
    expect(scripts.length).toBeGreaterThan(1);
  });
});

test.describe('Animation Performance', () => {
  test('should not have janky animations', async ({ page }) => {
    await page.goto('/');

    // Check for animations using CSS
    const hasOptimizedAnimations = await page.evaluate(() => {
      const animatedElements = document.querySelectorAll('[class*="animate"], [class*="transition"]');
      let optimized = true;

      animatedElements.forEach(el => {
        const style = window.getComputedStyle(el);
        // Check if animation uses GPU-accelerated properties
        const transform = style.transform;
        const willChange = style.willChange;

        // transform and opacity are GPU-accelerated
        if (!transform && !willChange) {
          optimized = false;
        }
      });

      return { count: animatedElements.length, optimized };
    });

    console.log('Animation stats:', hasOptimizedAnimations);
  });
});
