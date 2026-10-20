// Visual tests: each demo page is compared with its reference screenshot.
// Live parts (3D, running bars, time, the cookie banner) are masked; reveal animations are off.
import { test, expect } from '@playwright/test';

const PAGES = ['index', 'kit', 'kit-2', 'kit-3'];
const CALM = `html{scroll-behavior:auto!important} .rv{opacity:1!important;transform:none!important;animation:none!important}
  .consent,.toasts,.bubble,.skip{display:none!important} *{caret-color:transparent!important}`;

for (const name of PAGES) {
  test(`${name}: matches the reference`, async ({ page }) => {
    await page.clock.install({ time: new Date('2026-10-19T12:00:00') });   // clocks and dates on the pages are identical on every run
    await page.goto(`/demo/${name}.html`);
    await page.addStyleTag({ content: CALM });
    await page.evaluate(() => document.fonts.ready);
    await page.clock.runFor(4000);
    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage: true,
      mask: [page.locator('canvas'), page.locator('.progress'), page.locator('.sk'), page.locator('#upv'), page.locator('.stage3d'), page.locator('.hero-stage')],
    });
  });
}
