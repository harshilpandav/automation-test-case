import { expect, test, type Page } from '@playwright/test';

/**
 * Shared helpers for the TestDino Demo Store suites.
 * Target app: https://storedemo.testdino.com
 *
 * The store is not the project's configured baseURL (that points at the
 * Playwright TodoMVC demo), so these specs navigate with absolute URLs.
 */
export const STORE = 'https://storedemo.testdino.com';

/** Total number of products the catalogue ships with. */
export const PRODUCT_COUNT = 14;

/**
 * Open a store route and wait until the client-rendered content is on screen.
 *
 * Waits on a header nav link rather than the logo: the logo is an <img> that
 * reports as hidden until it has decoded, which made this intermittently fail
 * under parallel load.
 */
export async function openStore(page: Page, path = '/') {
  await page.goto(`${STORE}${path}`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('header-menu-home')).toBeVisible({ timeout: 15000 });
}

/** Open the catalogue and wait for the product grid to render. */
export async function openCatalogue(page: Page) {
  await openStore(page, '/products');
  await expect(page.getByTestId('all-products-header').first()).toBeVisible();
}

/**
 * Add the nth catalogue card to the cart.
 * The button lives in a hover overlay, so it needs a scroll and a forced click.
 */
export async function addProductToCart(page: Page, index = 0) {
  const button = page.getByTestId('all-products-cart-button').nth(index);
  await button.scrollIntoViewIfNeeded();
  await button.click({ force: true });
}

/** Open the cart drawer and wait for it to be populated. */
export async function openCartDrawer(page: Page) {
  await page.getByTestId('header-cart-icon').click({ force: true });
  const drawer = page.getByTestId('cart-drawer');
  await expect(drawer.getByTestId('cart-header')).toBeVisible();
  return drawer;
}

/**
 * First attempt returns the stale (pre-update) value a race would observe;
 * retries return the settled value. Used to make a test reliably flaky.
 */
export function whenFlaky<T>(stale: T, settled: T): T {
  return test.info().retry === 0 ? stale : settled;
}

/** Keep the first, failing attempt of a flaky test short. */
export const FLAKY_TIMEOUT = { timeout: 3000 };
