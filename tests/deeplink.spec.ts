import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'https://twwoo0210.github.io/erp-assist';
const fresh = (path: string) => `${BASE}${path}${path.includes('?') ? '&' : '?'}nocache=${Date.now()}`;

test.describe('Deep link fallback works on GitHub Pages', () => {
  test('unauthenticated /chat deep link redirects to /auth/login', async ({ page }) => {
    const res = await page.goto(fresh('/chat'));
    expect(res?.status()).toBeGreaterThanOrEqual(200);
    await page.waitForLoadState('domcontentloaded');
    await expect(async () => {
      const path = new URL(page.url()).pathname;
      expect(path.endsWith('/auth/login') || path.endsWith('/auth/login/')).toBeTruthy();
    }).toPass({ timeout: 15000 });
  });

  test('unauthenticated /dashboard deep link redirects to /auth/login', async ({ page }) => {
    const res = await page.goto(fresh('/dashboard'));
    expect(res?.status()).toBeGreaterThanOrEqual(200);
    await page.waitForLoadState('domcontentloaded');
    await expect(async () => {
      const path = new URL(page.url()).pathname;
      expect(path.endsWith('/auth/login') || path.endsWith('/auth/login/')).toBeTruthy();
    }).toPass({ timeout: 15000 });
  });
});
