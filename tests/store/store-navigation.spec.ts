import { test, expect } from '@playwright/test';
import { openStore, whenFlaky, FLAKY_TIMEOUT } from './store-helpers';

/**
 * TestDino Demo Store — home page, navigation and static pages.
 *
 * 10 tests: 6 expected to pass, 3 expected to fail, 1 flaky by design.
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

  test('NAV-02: should have the expected page title on the home page', async ({ page }) => {
    await test.step('Open the home page', async () => {
      await openStore(page, '/');
    });

    await test.step('Verify the document title names the demo store', async () => {
      await expect(page).toHaveTitle(/TestDino \| Demo Store/);
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

  test('NAV-04: should render the four product categories on the home page', async ({ page }) => {
    await test.step('Open the home page', async () => {
      await openStore(page, '/');
    });

    await test.step('Verify the categories section is visible', async () => {
      await expect(page.getByTestId('product-categories')).toBeVisible();
    });

    await test.step('Verify each category tile has a title', async () => {
      for (const category of ['camera', 'appliances', 'gadgets', 'laptop']) {
        await expect(page.getByTestId(`category-title-${category}`)).toBeVisible();
      }
    });
  });

  test('NAV-05: should open the About Us page from the header', async ({ page }) => {
    await test.step('Open the home page', async () => {
      await openStore(page, '/');
    });

    await test.step('Click "About Us" in the header', async () => {
      await page.getByTestId('header-menu-about-us').click();
    });

    await test.step('Verify the About Us page is shown', async () => {
      await expect(page).toHaveURL(/\/about-us$/);
      await expect(page).toHaveTitle(/About Us/);
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

  test('NAV-08: contact page should confirm submission of an empty form', async ({ page }) => {
    await test.step('Open the Contact Us page', async () => {
      await openStore(page, '/contact-us');
    });

    await test.step('Submit the form without filling anything in', async () => {
      await page.getByRole('button', { name: /send message/i }).click();
    });

    await test.step('Expect a success confirmation for the empty submission', async () => {
      await expect(page.getByText(/message sent/i)).toBeVisible();
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
