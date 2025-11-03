import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || 'https://twwoo0210.github.io/erp-assist'
const EMAIL = process.env.TEST_EMAIL
const PASSWORD = process.env.TEST_PASSWORD

// Always bypass cache to avoid stale bundles during Pages deploys
const fresh = (path: string) => `${BASE}${path}${path.includes('?') ? '&' : '?'}nocache=${Date.now()}`

test.describe('Auth flow (login -> dashboard -> logout)', () => {
  test.beforeAll(async () => {
    if (!EMAIL || !PASSWORD) {
      test.skip(true, 'TEST_EMAIL/TEST_PASSWORD not provided')
    }
  })

  test('login redirects to dashboard; logout returns to login', async ({ page }) => {
    test.skip(!EMAIL || !PASSWORD, 'TEST_EMAIL/TEST_PASSWORD not provided')

    // Go to login
    await page.goto(fresh('/auth/login'))

    // Fill email/password
    await page.fill('input#email', EMAIL!)
    await page.fill('input#password', PASSWORD!)
    await page.click('button[type="submit"]')

    // Expect to land on dashboard (protected) or capture login error for debugging
    try {
      await expect(async () => {
        const url = new URL(page.url())
        expect(url.pathname.endsWith('/dashboard') || url.hash.includes('/dashboard')).toBeTruthy()
      }).toPass({ timeout: 20000 })
    } catch (err) {
      // If login failed, surface error banner text (if any)
      const errorBanner = page.locator('div.bg-red-50')
      if (await errorBanner.isVisible({ timeout: 1000 }).catch(() => false)) {
        const msg = (await errorBanner.innerText()).trim()
        console.error('Login error banner:', msg)
      }
      throw err
    }

    // Basic sanity: sb-* tokens exist in localStorage
    const hasSbTokens = await page.evaluate(() => {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i) || ''
          if (k.startsWith('sb-')) return true
        }
      } catch {}
      return false
    })
    expect(hasSbTokens).toBeTruthy()

    // Open user menu (button with arrow-down icon)
    await page.click('button:has(i.ri-arrow-down-s-line)')

    // Click logout (button containing logout icon)
    await page.click('button:has(i.ri-logout-box-line)')

    // Expect redirect to /auth/login and sb-* cleared
    await expect(async () => {
      const url = new URL(page.url())
      expect(url.pathname.endsWith('/auth/login') || url.hash.includes('/auth/login')).toBeTruthy()
    }).toPass({ timeout: 15000 })

    const hasSbTokensAfter = await page.evaluate(() => {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i) || ''
          if (k.startsWith('sb-')) return true
        }
      } catch {}
      return false
    })
    expect(hasSbTokensAfter).toBeFalsy()
  })
})
