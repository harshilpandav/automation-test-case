import { test, expect } from '@playwright/test';
import {
  PRODUCT_COUNT,
  addProductToCart,
  openCatalogue,
  openStore,
  whenFlaky,
  FLAKY_TIMEOUT,
} from './store-helpers';

/**
 * TestDino Demo Store — catalogue and search.
 *
 * 7 tests: 4 expected to pass, 2 expected to fail, 1 flaky by design.
 * The failing tests assert behaviour the store does not implement; they
 * exist to exercise failure reporting and should not be "fixed" by
 * loosening the assertion.
 */

test.describe('Store catalogue — passing', () => {
  test.beforeEach(async ({ page }) => {
    await openCatalogue(page);
  });

  test('CAT-01: should list the full catalogue with a results count', async ({ page }) => {
    await test.step('Verify the page heading is visible', async () => {
      await expect(page.getByTestId('all-products-title')).toBeVisible();
    });

    await test.step(`Verify all ${PRODUCT_COUNT} product cards render`, async () => {
      await expect(page.getByTestId('all-products-header')).toHaveCount(PRODUCT_COUNT);
    });

    await test.step('Verify the results count matches the card count', async () => {
      await expect(page.getByTestId('all-products-results-count')).toContainText(
        `${PRODUCT_COUNT} products`,
      );
    });
  });

  test('CAT-02: should narrow results when searching by product name', async ({ page }) => {
    await test.step('Search for "GoPro"', async () => {
      await page.getByTestId('all-products-search-input').fill('GoPro');
    });

    await test.step('Verify a single matching product is listed', async () => {
      await expect(page.getByTestId('all-products-header')).toHaveCount(1);
      await expect(page.getByTestId('all-products-header')).toHaveText(['GoPro HERO10 Black']);
    });

    await test.step('Verify the results count reflects the filtered list', async () => {
      await expect(page.getByTestId('all-products-results-count')).toContainText('1 products');
    });
  });


  test('CAT-04: should show an empty result set for an unknown search term', async ({ page }) => {
    await test.step('Search for a term that matches nothing', async () => {
      await page.getByTestId('all-products-search-input').fill('zzzznotaproduct');
    });

    await test.step('Verify no product cards are rendered', async () => {
      await expect(page.getByTestId('all-products-header')).toHaveCount(0);
    });

    await test.step('Verify the empty state is reported', async () => {
      await expect(page.getByTestId('all-products-results-count')).toContainText('No products found');
    });
  });

  test('CAT-05: should expose filter controls behind the Filters toggle', async ({ page }) => {
    await test.step('Verify the filter controls are hidden initially', async () => {
      await expect(page.getByTestId('all-products-category-select')).toBeHidden();
    });

    await test.step('Open the filter panel', async () => {
      await page.getByTestId('all-products-filter-toggle').click({ force: true });
    });

    await test.step('Verify category, price range and reset controls are available', async () => {
      await expect(page.getByTestId('all-products-category-select')).toBeVisible();
      await expect(page.getByTestId('all-products-price-range-input-0')).toBeVisible();
      await expect(page.getByTestId('all-products-reset-filters-button')).toBeVisible();
    });
  });

});

test.describe('Store catalogue — failing', () => {
  test.beforeEach(async ({ page }) => {
    await openCatalogue(page);
  });

  test('CAT-07: catalogue should contain 20 products', async ({ page }) => {
    await test.step('Expect the catalogue to hold 20 products', async () => {
      await expect(page.getByTestId('all-products-header')).toHaveCount(20);
    });
  });


  test('CAT-09: product detail page should show the product title', async ({ page }) => {
    await test.step('Open the GoPro product detail page', async () => {
      await openStore(page, '/product/gopro-hero10-black');
    });

    await test.step('Expect the product name to be rendered on the detail page', async () => {
      await expect(page.getByRole('heading', { name: 'GoPro HERO10 Black' })).toBeVisible();
    });
  });
});

test.describe('Store catalogue — flaky', () => {
  test.describe.configure({ retries: 2 });

  test.beforeEach(async ({ page }) => {
    await openCatalogue(page);
  });

  test('CAT-10: results count should settle after adding to the cart', async ({ page }) => {
    await test.step('Add the first product to the cart', async () => {
      await addProductToCart(page, 0);
    });

    await test.step('Read the results count, racing the grid re-render', async () => {
      await expect(page.getByTestId('all-products-results-count')).toContainText(
        whenFlaky('13 products', `${PRODUCT_COUNT} products`),
        FLAKY_TIMEOUT,
      );
    });
  });
});
