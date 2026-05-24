const { test, expect } = require('@playwright/test');

test('navigate all 12 slides', async ({ page }) => {
  await page.goto('/');
  for (let i = 1; i <= 12; i++) {
    await expect(page.locator('.slide.active')).toHaveAttribute('id', `slide-${i}`);
    if (i < 12) {
      if (i === 5) await page.click('#reveal-btn-5');
      if (i === 8) {
        await page.click('#reveal-btn-q1');
        await page.click('#reveal-btn-q2');
      }
      await page.click('#nextBtn');
    }
  }
});

test('language toggle persists across navigation', async ({ page }) => {
  await page.goto('/');
  // initial state is zh — button shows current state "中文"
  await expect(page.locator('#langToggle')).toHaveText('中文');
  await page.click('#langToggle');
  await expect(page.locator('#langToggle')).toHaveText('EN');
  await page.goto('/resources');
  await expect(page.locator('#langToggle')).toHaveText('EN');
});

test('reveal buttons gate slide advance', async ({ page }) => {
  await page.goto('/');
  // advance to slide 5
  for (let i = 0; i < 4; i++) await page.click('#nextBtn');
  await expect(page.locator('#nextBtn')).toBeDisabled();
  await expect(page.locator('#nextBtn')).toHaveAttribute('aria-label', /Complete this slide first/);
  await page.click('#reveal-btn-5');
  await expect(page.locator('#nextBtn')).toBeEnabled();
  await expect(page.locator('#nextBtn')).toHaveAttribute('aria-label', /Next slide/);
});

test('slide 8 quiz requires both Q1 and Q2 reveals before advancing', async ({ page }) => {
  await page.goto('/');
  // advance to slide 8: 1→2→3→4→5(reveal)→6→7→8
  for (let i = 0; i < 4; i++) await page.click('#nextBtn');
  await page.click('#reveal-btn-5');
  for (let i = 0; i < 3; i++) await page.click('#nextBtn');
  await expect(page.locator('.slide.active')).toHaveAttribute('id', 'slide-8');
  await expect(page.locator('#nextBtn')).toBeDisabled();
  await page.click('#reveal-btn-q1');
  // Q2 revealed but unanswered -> still gated
  await expect(page.locator('#nextBtn')).toBeDisabled();
  await page.click('#reveal-btn-q2');
  await expect(page.locator('#nextBtn')).toBeEnabled();
});

test('404 page renders branded fallback', async ({ page }) => {
  // CF Pages serves /404.html on any unknown route. Locally `npx serve` returns
  // its own 404 chrome, so we test the page itself renders correctly.
  await page.goto('/404.html');
  await expect(page.locator('.err-code')).toHaveText('404');
  await expect(page.locator('.err-zh')).toHaveText('页面未找到');
});
