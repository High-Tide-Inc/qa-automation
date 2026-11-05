import { test, expect } from '@playwright/test';
import { openStore, firstAvailableProductHandle, dismissPopups, dismissCookieBanner } from '../../helpers/store';

// Product links inside the page content (excludes hidden mega-menu links)
const MAIN_PRODUCT_LINKS = 'main a[href*="/products/"]:visible, #MainContent a[href*="/products/"]:visible';

/**
 * P1 smoke journeys (QA Test Strategy section 8). Read-only on production:
 * browse and cart only - never completes checkout, payment or account changes.
 */
test.describe('Storefront smoke @smoke @p1', () => {
  test('UI-SC-HOME-001 homepage loads with header, navigation and footer', async ({ page }) => {
    await openStore(page, '/');
    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator('header').first()).toBeVisible();
    await expect(page.locator('footer').first()).toBeAttached();
    await expect(page.locator('a[href*="/collections/"]').first()).toBeAttached();
  });

  test('UI-SC-SRCH-001 search returns products for a common keyword', async ({ page }) => {
    await openStore(page, '/search?q=bong&type=product');
    await expect(page.locator(MAIN_PRODUCT_LINKS).first()).toBeVisible();
  });

  test('UI-SC-COL-001 a collection page lists products', async ({ page }) => {
    await openStore(page, '/collections/all');
    await expect(page.locator(MAIN_PRODUCT_LINKS).first()).toBeVisible();
    expect(await page.locator(MAIN_PRODUCT_LINKS).count(), 'products listed').toBeGreaterThan(3);
  });

  test('UI-SC-PDP-001 product page shows title, price and add-to-cart', async ({ page }) => {
    const handle = await firstAvailableProductHandle(page);
    await openStore(page, `/products/${handle}`);
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('form[action*="/cart/add"]').first()).toBeAttached();
    await expect(page.locator('main, #MainContent').first().getByText(/\$\s?\d/).locator('visible=true').first()).toBeVisible();
  });

  test('UI-SC-CART-001 add to cart updates the cart (no checkout)', async ({ page }) => {
    const handle = await firstAvailableProductHandle(page);
    await openStore(page, `/products/${handle}`);
    const add = page.getByRole('button', { name: /add to (cart|bag)/i }).locator('visible=true').first();
    await add.scrollIntoViewIfNeeded();
    await dismissCookieBanner(page);
    await dismissPopups(page);          // late popups (e.g. newsletter) can cover the button on mobile
    await add.click({ timeout: 20_000 });
    await expect.poll(async () => (await (await page.request.get('/cart.js')).json()).item_count, {
      message: 'cart item count after add to cart', timeout: 15_000,
    }).toBeGreaterThan(0);
  });
});
