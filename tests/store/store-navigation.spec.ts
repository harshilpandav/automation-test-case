import { test, expect } from '@playwright/test';
import { openStore, whenFlaky, FLAKY_TIMEOUT } from './store-helpers';

/**
 * TestDino Demo Store — home page, navigation and static pages.
 *
 * 6 tests: 3 expected to pass, 2 expected to fail, 1 flaky by design.
 */

test.describe('Store navigation — passing', () => {
  test('NAV-01: should render the home page hero and shop action', async ({ page }) => {
    await test.step('Open the home page', async () => {
      await openStore(page, '/');
    });

    await test.step('Verify the hero section and title are visible', async () => {
      await expect(page.getByTestId('hero-section')).toBeVisible();
      await expect(page.getByTestId('hero-title')).not.toBeEmpty();
    });

    await test.step('Verify the hero "Shop Now" call to action is present', async () => {
      await expect(page.getByTestId('hero-shop-now')).toBeVisible();
    });
  });


  test('NAV-03: should navigate to the catalogue from the header menu', async ({ page }) => {
    await test.step('Open the home page', async () => {
      await openStore(page, '/');
    });

    await test.step('Click "All Products" in the header', async () => {
      await page.getByTestId('header-menu-all-products').click();
    });

    await test.step('Verify the catalogue page is shown', async () => {
      await expect(page).toHaveURL(/\/products$/);
      await expect(page.getByTestId('all-products-title')).toBeVisible();
    });
  });



  test('NAV-06: should show an empty wishlist by default', async ({ page }) => {
    await test.step('Open the wishlist page', async () => {
      await openStore(page, '/wishlist');
    });

    await test.step('Verify the empty-wishlist message is shown', async () => {
      await expect(page.getByText('Your wishlist is empty')).toBeVisible();
    });
  });
});

test.describe('Store navigation — failing', () => {
  test('NAV-07: header should expose a "Blog" menu entry', async ({ page }) => {
    await test.step('Open the home page', async () => {
      await openStore(page, '/');
    });

    await test.step('Expect a Blog link in the header navigation', async () => {
      await expect(page.getByRole('link', { name: 'Blog' })).toBeVisible();
    });
  });


  test('NAV-09: footer should display a 2020 copyright notice', async ({ page }) => {
    await test.step('Open the home page', async () => {
      await openStore(page, '/');
    });

    await test.step('Expect the footer copyright to read 2020', async () => {
      await expect(page.getByTestId('footer-copyright')).toContainText('2020');
    });
  });
});

test.describe('Store navigation — flaky', () => {
  test.describe.configure({ retries: 2 });

  test('NAV-10: subscribe input should clear after submitting an email', async ({ page }) => {
    await test.step('Open the home page', async () => {
      await openStore(page, '/');
    });

    await test.step('Fill in the subscribe email field', async () => {
      const email = page.getByTestId('email-input');
      await email.scrollIntoViewIfNeeded();
      await email.fill('qa@testdino.com');
    });

    await test.step('Read the field value, racing the subscribe handler', async () => {
      await expect(page.getByTestId('email-input')).toHaveValue(
        whenFlaky('', 'qa@testdino.com'),
        FLAKY_TIMEOUT,
      );
    });
  });
});
