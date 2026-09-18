import { test, expect, type Page } from '@playwright/test';

/**
 * TodoMVC end-to-end tests
 * Target app: https://demo.playwright.dev/todomvc
 *
 * Every test is broken into named test.step() blocks so each
 * step is reported individually in the Playwright report and TestDino.
 */

const TODO_ITEMS = ['Buy groceries', 'Write Playwright tests', 'Review pull request'] as const;

test.describe('TodoMVC', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/todomvc');
  });

  test('TC-01: should add a new todo item', async ({ page }) => {
    const newTodo = page.getByPlaceholder('What needs to be done?');

    await test.step('Verify the todo input is visible and empty', async () => {
      await expect(newTodo).toBeVisible();
      await expect(newTodo).toBeEmpty();
    });

    await test.step('Type a todo and press Enter', async () => {
      await newTodo.fill(TODO_ITEMS[0]);
      await newTodo.press('Enter');
    });

    await test.step('Verify the todo appears in the list', async () => {
      await expect(page.getByTestId('todo-title')).toHaveText([TODO_ITEMS[0]]);
    });

    await test.step('Verify the input is cleared after adding', async () => {
      await expect(newTodo).toBeEmpty();
    });

    await test.step('Verify the item counter shows 1 item left', async () => {
      await expect(page.getByTestId('todo-count')).toContainText('1 item left');
    });
  });

  test('TC-02: should mark a todo as completed', async ({ page }) => {
    await test.step('Add a todo item', async () => {
      await createTodos(page, [TODO_ITEMS[0]]);
    });

    await test.step('Click the toggle checkbox on the todo', async () => {
      await page.getByTestId('todo-item').getByRole('checkbox').check();
    });

    await test.step('Verify the todo has the "completed" class', async () => {
      await expect(page.getByTestId('todo-item')).toHaveClass(/completed/);
    });

    await test.step('Verify the counter shows 0 items left', async () => {
      await expect(page.getByTestId('todo-count')).toContainText('0 items left');
    });

    await test.step('Verify the "Clear completed" button is visible', async () => {
      await expect(page.getByRole('button', { name: 'Clear completed' })).toBeVisible();
    });
  });

  test('TC-03: should edit an existing todo item', async ({ page }) => {
    const updatedText = 'Buy groceries and milk';

    await test.step('Add a todo item', async () => {
      await createTodos(page, [TODO_ITEMS[0]]);
    });

    await test.step('Double-click the todo to enter edit mode', async () => {
      await page.getByTestId('todo-item').dblclick();
      await expect(page.getByTestId('todo-item')).toHaveClass(/editing/);
    });

    await test.step('Replace the text and press Enter to save', async () => {
      const editInput = page.getByTestId('todo-item').getByRole('textbox', { name: 'Edit' });
      await editInput.fill(updatedText);
      await editInput.press('Enter');
    });

    await test.step('Verify the todo displays the updated text', async () => {
      await expect(page.getByTestId('todo-title')).toHaveText([updatedText]);
    });

    await test.step('Verify edit mode is exited', async () => {
      await expect(page.getByTestId('todo-item')).not.toHaveClass(/editing/);
    });
  });

  test('TC-04: should delete a todo item', async ({ page }) => {
    await test.step('Add two todo items', async () => {
      await createTodos(page, [TODO_ITEMS[0], TODO_ITEMS[1]]);
    });

    await test.step('Verify both items are listed', async () => {
      await expect(page.getByTestId('todo-title')).toHaveText([TODO_ITEMS[0], TODO_ITEMS[1]]);
    });

    await test.step('Hover over the first item and click its delete button', async () => {
      const firstItem = page.getByTestId('todo-item').first();
      await firstItem.hover();
      await firstItem.getByRole('button', { name: 'Delete' }).click();
    });

    await test.step('Verify only the second item remains', async () => {
      await expect(page.getByTestId('todo-title')).toHaveText([TODO_ITEMS[1]]);
    });

    await test.step('Verify the counter shows 1 item left', async () => {
      await expect(page.getByTestId('todo-count')).toContainText('1 item left');
    });
  });

  test('TC-05: should filter todos by Active and Completed', async ({ page }) => {
    await test.step('Add three todo items', async () => {
      await createTodos(page, [...TODO_ITEMS]);
    });

    await test.step('Complete the second item', async () => {
      await page.getByTestId('todo-item').nth(1).getByRole('checkbox').check();
    });

    await test.step('Click the "Active" filter', async () => {
      await page.getByRole('link', { name: 'Active' }).click();
    });

    await test.step('Verify only the two active items are shown', async () => {
      await expect(page.getByTestId('todo-title')).toHaveText([TODO_ITEMS[0], TODO_ITEMS[2]]);
    });

    await test.step('Click the "Completed" filter', async () => {
      await page.getByRole('link', { name: 'Completed' }).click();
    });

    await test.step('Verify only the completed item is shown', async () => {
      await expect(page.getByTestId('todo-title')).toHaveText([TODO_ITEMS[1]]);
    });

    await test.step('Click the "All" filter and verify all three items are shown', async () => {
      await page.getByRole('link', { name: 'All' }).click();
      await expect(page.getByTestId('todo-title')).toHaveText([...TODO_ITEMS]);
    });
  });
});

/** Helper: add multiple todos and wait until they are rendered. */
async function createTodos(page: Page, items: readonly string[]) {
  const newTodo = page.getByPlaceholder('What needs to be done?');
  for (const item of items) {
    await newTodo.fill(item);
    await newTodo.press('Enter');
  }
  await expect(page.getByTestId('todo-title')).toHaveCount(items.length);
}
