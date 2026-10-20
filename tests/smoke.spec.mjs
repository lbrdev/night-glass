// Smoke tests: each page loads without errors or horizontal scroll, and the main elements behave as expected.
import { test, expect } from '@playwright/test';

const PAGES = ['index', 'kit', 'kit-2', 'kit-3'];

for (const name of PAGES) {
  test(`${name}: no errors and no horizontal scroll`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => m.type() === 'error' && errors.push(m.text()));
    await page.goto(`/demo/${name}.html`);
    await page.waitForLoadState('networkidle');
    const [sw, cw] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    expect(sw, 'page is no wider than the window').toBeLessThanOrEqual(cw);
    expect(errors).toEqual([]);
  });
}

test('kit-3: dialog opens, Esc closes it, focus returns', async ({ page }) => {
  await page.goto('/demo/kit-3.html');
  const btn = page.locator('[data-open="dlgSheet"]');
  await btn.click();
  await expect(page.locator('#dlgSheet')).toHaveAttribute('open', '');
  await page.keyboard.press('Escape');
  await expect(page.locator('#dlgSheet')).not.toHaveAttribute('open', '');
  await expect(btn).toBeFocused();
});

test('kit-3: arrow keys in the date field change the date, not the menu item', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the period menu is a keyboard check');
  await page.goto('/demo/kit-3.html');
  await page.locator('#dr [data-menu]').click();
  const from = page.locator('#drm .custom input').first();
  await from.focus();
  await page.keyboard.press('ArrowUp');
  await expect(from).toHaveValue('2026-09-02');
  await page.keyboard.press('Tab');
  await expect(page.locator('#drm')).toBeVisible();
});

test('kit-2: the dropdown changes the value of the real select', async ({ page, isMobile }) => {
  test.skip(isMobile, 'phones keep the native list');
  await page.goto('/demo/kit-2.html');
  await page.locator('#charts .ng-trigger').click();
  await page.locator('#charts .ng-list [data-i="1"]').click();
  await expect(page.locator('#region')).toHaveValue('.62');
});

test('kit-3: code sign-in: a wrong code shakes, the right one lets you in', async ({ page }) => {
  await page.goto('/demo/kit-3.html');
  await page.locator('#authEmail').fill('me@example.com');
  await page.locator('#authMail .btn').click();
  await page.locator('#otp input').first().focus();
  await page.keyboard.type('111111');
  await expect(page.locator('#otp')).toHaveClass(/err/);
  await page.waitForTimeout(500);
  await page.locator('#otp input').first().focus();
  await page.keyboard.type('482913');
  await expect(page.locator('.toast').last()).toContainText('Signed in');
});
