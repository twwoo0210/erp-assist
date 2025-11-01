import { test, expect } from '@playwright/test';

const BASE = 'https://twwoo0210.github.io/erp-assist';

// Always bypass cache to avoid stale bundles during Pages deploys
const fresh = (path: string) => `${BASE}${path}${path.includes('?') ? '&' : '?'}nocache=${Date.now()}`;

test('SPA fallback works and redirects unauthenticated /dashboard to /auth/login', async ({ page }) => {
  const res = await page.goto(fresh('/dashboard'));
  // GitHub Pages serves 404 but our SPA index should still boot
  expect(res?.status()).toBeGreaterThanOrEqual(200);

  // The app should redirect unauthenticated users to /auth/login
  await page.waitForLoadState('domcontentloaded');
  await expect(async () => {
    const path = new URL(page.url()).pathname;
    expect(path.endsWith('/auth/login') || path.endsWith('/auth/login/')).toBeTruthy();
  }).toPass();

  // Basic login form presence
  await expect(page.locator('input#email')).toBeVisible();
  await expect(page.locator('input#password')).toBeVisible();
});

test('Home loads and navigation bundle is present', async ({ page }) => {
  await page.goto(fresh('/'));
  await page.waitForLoadState('domcontentloaded');
  // Navbar brand or header exists
  await expect(page.locator('text=ERP Assist')).toBeVisible({ timeout: 5000 });
});
