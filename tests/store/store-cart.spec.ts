import { test, expect } from '@playwright/test';
import {
  addProductToCart,
  openCartDrawer,
  openCatalogue,
  openStore,
  whenFlaky,
  FLAKY_TIMEOUT,
} from './store-helpers';

/**
 * TestDino Demo Store — cart drawer, quantities and totals.
 *
 * 10 tests: 6 expected to pass, 3 expected to fail, 1 flaky by design.
 */

test.describe('Store cart — passing', () => {
  test.beforeEach(async ({ page }) => {
    await openCatalogue(page);
  });

  test('CART-01: should add a product to the cart', async ({ page }) => {
    await test.step('Add the first catalogue product to the cart', async () => {
      await addProductToCart(page, 0);
    });

    await test.step('Open the cart drawer', async () => {
      const drawer = await openCartDrawer(page);
      await expect(drawer.getByTestId('cart-item')).toHaveCount(1);
    });

    await test.step('Verify the line item has a title and a price', async () => {
      const drawer = page.getByTestId('cart-drawer');
      await expect(drawer.getByTestId('cart-item-header').first()).not.toBeEmpty();
      await expect(drawer.getByTestId('item-price').first()).toContainText('$');
    });
  });

  test('CART-02: should start with an empty cart', async ({ page }) => {
    await test.step('Open the cart drawer without adding anything', async () => {
      await openCartDrawer(page);
    });

    await test.step('Verify no line items are present', async () => {
      await expect(page.getByTestId('cart-drawer').getByTestId('cart-item')).toHaveCount(0);
    });

    await test.step('Verify the empty-cart message is shown', async () => {
      await expect(page.getByTestId('cart-drawer')).toContainText('Your cart is empty');
    });
  });

  test('CART-03: should increase the quantity of a line item', async ({ page }) => {
    await test.step('Add a product and open the cart', async () => {
      await addProductToCart(page, 0);
      await openCartDrawer(page);
    });

    await test.step('Verify the starting quantity is 1', async () => {
      await expect(page.getByTestId('item-quantity').first()).toHaveText('1');
    });

    await test.step('Click the increase-quantity control', async () => {
      await page.getByTestId('increase-quantity').first().click();
    });

    await test.step('Verify the quantity is now 2', async () => {
      await expect(page.getByTestId('item-quantity').first()).toHaveText('2');
    });
  });

  test('CART-04: should decrease the quantity back down', async ({ page }) => {
    await test.step('Add a product, open the cart and raise the quantity to 2', async () => {
      await addProductToCart(page, 0);
      await openCartDrawer(page);
      await page.getByTestId('increase-quantity').first().click();
      await expect(page.getByTestId('item-quantity').first()).toHaveText('2');
    });

    await test.step('Click the decrease-quantity control', async () => {
      await page.getByTestId('decrease-quantity').first().click();
    });

    await test.step('Verify the quantity is back to 1', async () => {
      await expect(page.getByTestId('item-quantity').first()).toHaveText('1');
    });
  });

  test('CART-05: should remove a line item from the cart', async ({ page }) => {
    await test.step('Add a product and open the cart', async () => {
      await addProductToCart(page, 0);
      const drawer = await openCartDrawer(page);
      await expect(drawer.getByTestId('cart-item')).toHaveCount(1);
    });

    await test.step('Click the remove control on the line item', async () => {
      await page.getByTestId('remove-item').first().click();
    });

    await test.step('Verify the cart is empty again', async () => {
      const drawer = page.getByTestId('cart-drawer');
      await expect(drawer.getByTestId('cart-item')).toHaveCount(0);
      await expect(drawer).toContainText('Your cart is empty');
    });
  });

  test('CART-06: should show a summary with subtotal, shipping and total', async ({ page }) => {
    await test.step('Add a product and open the cart', async () => {
      await addProductToCart(page, 0);
      await openCartDrawer(page);
    });

    await test.step('Verify the summary rows are rendered', async () => {
      await expect(page.getByTestId('cart-summary')).toBeVisible();
      await expect(page.getByTestId('subtotal-value')).toContainText('$');
      await expect(page.getByTestId('shipping-value')).toContainText('Free');
    });

    await test.step('Verify the total matches the subtotal while shipping is free', async () => {
      const subtotal = await page.getByTestId('subtotal-value').innerText();
      await expect(page.getByTestId('total-value')).toHaveText(subtotal.trim());
    });

    await test.step('Verify the checkout and view-cart actions are offered', async () => {
      await expect(page.getByTestId('checkout-button')).toBeVisible();
      await expect(page.getByTestId('view-cart-button')).toBeVisible();
    });
  });
});

test.describe('Store cart — failing', () => {
  test.beforeEach(async ({ page }) => {
    await openCatalogue(page);
  });

  test('CART-07: shipping should be charged at $9.99', async ({ page }) => {
    await test.step('Add a product and open the cart', async () => {
      await addProductToCart(page, 0);
      await openCartDrawer(page);
    });

    await test.step('Expect a $9.99 shipping charge on the summary', async () => {
      await expect(page.getByTestId('shipping-value')).toContainText('$9.99');
    });
  });

  test('CART-08: adding the same product twice should raise its quantity to 2', async ({ page }) => {
    await test.step('Add the first product to the cart twice', async () => {
      await addProductToCart(page, 0);
      await addProductToCart(page, 0);
      await openCartDrawer(page);
    });

    await test.step('Verify the two adds were merged into a single line item', async () => {
      await expect(page.getByTestId('cart-drawer').getByTestId('cart-item')).toHaveCount(1);
    });

    await test.step('Expect that line item to carry a quantity of 2', async () => {
      await expect(page.getByTestId('item-quantity').first()).toHaveText('2');
    });
  });

  test('CART-09: the standalone cart page should list added items', async ({ page }) => {
    await test.step('Add a product to the cart', async () => {
      await addProductToCart(page, 0);
    });

    await test.step('Navigate to the /cart page', async () => {
      await openStore(page, '/cart');
    });

    await test.step('Expect the added product to be listed on the cart page', async () => {
      await expect(page.getByTestId('cart-item').first()).toBeVisible();
    });
  });
});

test.describe('Store cart — flaky', () => {
  test.describe.configure({ retries: 2 });

  test.beforeEach(async ({ page }) => {
    await openCatalogue(page);
  });

  test('CART-10: quantity should settle after a rapid bump', async ({ page }) => {
    await test.step('Add a product and open the cart', async () => {
      await addProductToCart(page, 0);
      await openCartDrawer(page);
    });

    await test.step('Increase the quantity to 2', async () => {
      await page.getByTestId('increase-quantity').first().click();
    });

    await test.step('Read the quantity, racing the line-item re-render', async () => {
      await expect(page.getByTestId('item-quantity').first()).toHaveText(
        whenFlaky('3', '2'),
        FLAKY_TIMEOUT,
      );
    });
  });
});
