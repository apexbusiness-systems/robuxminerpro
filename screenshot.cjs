const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('http://localhost:8080/auth');
  await page.waitForTimeout(2000);

  const bypassButton = page.getByRole('button', { name: /APEX EMERGENCY BYPASS/i });
  await bypassButton.click();

  try {
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'dashboard_screenshot.png', fullPage: true });
      console.log('Screenshot saved to dashboard_screenshot.png');
  } catch (e) {
      await page.screenshot({ path: 'error_screenshot.png', fullPage: true });
      console.log('Error navigating to dashboard, saved error_screenshot.png');
  }
  await browser.close();
})();
