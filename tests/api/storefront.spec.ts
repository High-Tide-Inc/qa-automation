import { test, expect } from '@playwright/test';

/** Storefront API checks (public, read-only). QA Test Strategy section 4 / 7.3. */
test.describe('Storefront API @smoke @api', () => {
  test('API-SC-PRD-001 products endpoint returns products with prices', async ({ request }) => {
    const start = Date.now();
    const res = await request.get('/products.json?limit=10');
    expect(res.status()).toBe(200);
    expect(Date.now() - start, 'response time (ms)').toBeLessThan(5_000);
    const { products } = await res.json();
    expect(products.length).toBeGreaterThan(0);
    for (const p of products) {
      expect(p.handle, 'product handle').toBeTruthy();
      expect(p.variants.length, `variants for ${p.handle}`).toBeGreaterThan(0);
      expect(Number(p.variants[0].price), `price for ${p.handle}`).toBeGreaterThan(0);
    }
  });

  test('API-SC-PRD-002 single product endpoint matches the product list', async ({ request }) => {
    const list = await (await request.get('/products.json?limit=1')).json();
    const handle = list.products[0].handle;
    const res = await request.get(`/products/${handle}.json`);
    expect(res.status()).toBe(200);
    const { product } = await res.json();
    expect(product.handle).toBe(handle);
    expect(product.variants[0].price).toBe(list.products[0].variants[0].price);
  });

  test('API-SC-PRD-003 unknown product returns 404', async ({ request }) => {
    const res = await request.get('/products/this-product-should-not-exist-qa-check.json');
    expect(res.status()).toBe(404);
  });

  test('API-SC-SRCH-001 predictive search returns results', async ({ request }) => {
    const res = await request.get('/search/suggest.json?q=bong&resources[type]=product');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.resources.results.products.length).toBeGreaterThan(0);
  });
});
