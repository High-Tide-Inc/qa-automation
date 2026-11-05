import { Page, expect } from '@playwright/test';

/** Dismiss the cookie banner if shown, choosing the most privacy-preserving option. On mobile it covers the age gate. */
export async function dismissCookieBanner(page: Page): Promise<boolean> {
  for (const name of [/only strictly necessary/i, /necessary cookies only/i, /reject (all|non-essential)/i, /decline/i, /allow all cookies|accept/i]) {
    const btn = page.getByRole('button', { name }).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click().catch(() => {});
      return true;
    }
  }
  return false;
}

/** Accept the age gate if one is shown (button text such as "Yes", "I am 21+", "Enter"). Safe to call on every page. */
export async function passAgeGate(page: Page): Promise<boolean> {
  const button = page.getByRole('button', { name: /^(yes|enter|i am (19|21|over)|i'?m (19|21|over)|confirm|over 21|21\+|19\+)/i }).first();
  try {
    await button.waitFor({ state: 'visible', timeout: 5_000 });
    await button.click();
    await expect(button).toBeHidden({ timeout: 5_000 });
    return true;
  } catch {
    return false; // no age gate shown (e.g. already accepted in this session)
  }
}

/** Close common newsletter / promo popups that block clicks. */
export async function dismissPopups(page: Page): Promise<void> {
  for (const name of [/close/i, /no,? thanks/i, /dismiss/i]) {
    const btn = page.getByRole('button', { name }).first();
    if (await btn.isVisible().catch(() => false)) await btn.click().catch(() => {});
  }
}

/** Open a page and get it into a usable state (age gate passed, popups closed). */
export async function openStore(page: Page, path = '/'): Promise<void> {
  const res = await page.goto(path, { waitUntil: 'domcontentloaded' });
  expect(res?.status(), `HTTP status for ${path}`).toBeLessThan(400);
  await page.waitForTimeout(1_500); // let the banners render
  await dismissCookieBanner(page);
  await passAgeGate(page);
  await dismissPopups(page);
}

/** Pick the handle of an available product from the public storefront API (read-only). */
export async function firstAvailableProductHandle(page: Page): Promise<string> {
  const res = await page.request.get('/products.json?limit=50');
  expect(res.status()).toBe(200);
  const { products } = await res.json();
  const p = products.find((x: any) => x.variants?.some((v: any) => v.available));
  expect(p, 'at least one available product').toBeTruthy();
  return p.handle;
}
