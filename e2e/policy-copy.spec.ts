import { test, expect } from '@playwright/test';

test.describe('No forbidden copy', () => {
  test('public pages do not contain scam copy', async ({ page }) => {
    const urls = ['/', '/pricing', '/features'];
    for (const url of urls) {
      await page.goto(url);
      const text = await page.textContent('body');
      expect(text?.toLowerCase()).not.toContain('generator');
      expect(text?.toLowerCase()).not.toContain('hack');
      expect(text?.toLowerCase()).not.toContain('cheat');
    }
  });
});
