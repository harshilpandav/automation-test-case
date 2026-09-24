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

/* ------------------------------------------------------------------ *
 * Extended suite — expected to PASS (TC-06 .. TC-20)
 * ------------------------------------------------------------------ */

test.describe('TodoMVC — extended (passing)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/todomvc');
  });

  test('TC-06: should clear completed items', async ({ page }) => {
    await test.step('Add three todos', async () => {
      await createTodos(page, [...TODO_ITEMS]);
    });

    await test.step('Complete the first todo', async () => {
      await page.getByTestId('todo-item').first().getByRole('checkbox').check();
    });

    await test.step('Click "Clear completed"', async () => {
      await page.getByRole('button', { name: 'Clear completed' }).click();
    });

    await test.step('Verify only the two active todos remain', async () => {
      await expect(page.getByTestId('todo-title')).toHaveText([TODO_ITEMS[1], TODO_ITEMS[2]]);
    });
  });

  test('TC-07: should mark all todos completed with toggle-all', async ({ page }) => {
    await test.step('Add three todos', async () => {
      await createTodos(page, [...TODO_ITEMS]);
    });

    await test.step('Click the toggle-all checkbox', async () => {
      await page.getByLabel('Mark all as complete').check();
    });

    await test.step('Verify every item has the completed class', async () => {
      await expect(page.getByTestId('todo-item')).toHaveClass([/completed/, /completed/, /completed/]);
    });

    await test.step('Verify the counter shows 0 items left', async () => {
      await expect(page.getByTestId('todo-count')).toContainText('0 items left');
    });
  });

  test('TC-08: should un-complete all todos by unchecking toggle-all', async ({ page }) => {
    await test.step('Add three todos and complete them all', async () => {
      await createTodos(page, [...TODO_ITEMS]);
      await page.getByLabel('Mark all as complete').check();
    });

    await test.step('Uncheck the toggle-all checkbox', async () => {
      await page.getByLabel('Mark all as complete').uncheck();
    });

    await test.step('Verify no item has the completed class', async () => {
      await expect(page.getByTestId('todo-item').first()).not.toHaveClass(/completed/);
    });

    await test.step('Verify the counter shows 3 items left', async () => {
      await expect(page.getByTestId('todo-count')).toContainText('3 items left');
    });
  });

  test('TC-09: should cancel an edit when Escape is pressed', async ({ page }) => {
    await test.step('Add a todo', async () => {
      await createTodos(page, [TODO_ITEMS[0]]);
    });

    await test.step('Enter edit mode and type new text', async () => {
      await page.getByTestId('todo-item').dblclick();
      const editInput = page.getByTestId('todo-item').getByRole('textbox', { name: 'Edit' });
      await editInput.fill('Discarded text');
      await editInput.press('Escape');
    });

    await test.step('Verify the original text is restored', async () => {
      await expect(page.getByTestId('todo-title')).toHaveText([TODO_ITEMS[0]]);
    });
  });

  test('TC-10: should remove the todo when edited to an empty string', async ({ page }) => {
    await test.step('Add two todos', async () => {
      await createTodos(page, [TODO_ITEMS[0], TODO_ITEMS[1]]);
    });

    await test.step('Clear the first todo text and press Enter', async () => {
      const firstItem = page.getByTestId('todo-item').first();
      await firstItem.dblclick();
      const editInput = firstItem.getByRole('textbox', { name: 'Edit' });
      await editInput.fill('');
      await editInput.press('Enter');
    });

    await test.step('Verify the emptied todo is removed', async () => {
      await expect(page.getByTestId('todo-title')).toHaveText([TODO_ITEMS[1]]);
    });
  });

  test('TC-11: should trim surrounding whitespace when adding a todo', async ({ page }) => {
    const newTodo = page.getByPlaceholder('What needs to be done?');

    await test.step('Add a todo padded with spaces', async () => {
      await newTodo.fill('   Padded todo   ');
      await newTodo.press('Enter');
    });

    await test.step('Verify the stored title is trimmed', async () => {
      await expect(page.getByTestId('todo-title')).toHaveText(['Padded todo']);
    });
  });

  test('TC-12: should use singular wording for exactly one remaining item', async ({ page }) => {
    await test.step('Add two todos', async () => {
      await createTodos(page, [TODO_ITEMS[0], TODO_ITEMS[1]]);
    });

    await test.step('Verify plural wording for two items', async () => {
      await expect(page.getByTestId('todo-count')).toContainText('2 items left');
    });

    await test.step('Complete one todo', async () => {
      await page.getByTestId('todo-item').first().getByRole('checkbox').check();
    });

    await test.step('Verify singular wording for one item', async () => {
      await expect(page.getByTestId('todo-count')).toContainText('1 item left');
    });
  });

  test('TC-13: should persist todos across a page reload', async ({ page }) => {
    await test.step('Add two todos', async () => {
      await createTodos(page, [TODO_ITEMS[0], TODO_ITEMS[1]]);
    });

    await test.step('Reload the page', async () => {
      await page.reload();
    });

    await test.step('Verify both todos are still listed', async () => {
      await expect(page.getByTestId('todo-title')).toHaveText([TODO_ITEMS[0], TODO_ITEMS[1]]);
    });
  });

  test('TC-14: should preserve insertion order for multiple todos', async ({ page }) => {
    await test.step('Add three todos in order', async () => {
      await createTodos(page, [...TODO_ITEMS]);
    });

    await test.step('Verify the list order matches the insertion order', async () => {
      await expect(page.getByTestId('todo-title')).toHaveText([...TODO_ITEMS]);
    });

    await test.step('Verify the counter shows 3 items left', async () => {
      await expect(page.getByTestId('todo-count')).toContainText('3 items left');
    });
  });

  test('TC-15: should save an edit when the input loses focus', async ({ page }) => {
    const updated = 'Saved on blur';

    await test.step('Add a todo', async () => {
      await createTodos(page, [TODO_ITEMS[0]]);
    });

    await test.step('Edit the todo and blur the input', async () => {
      await page.getByTestId('todo-item').dblclick();
      const editInput = page.getByTestId('todo-item').getByRole('textbox', { name: 'Edit' });
      await editInput.fill(updated);
      await editInput.blur();
    });

    await test.step('Verify the edit was saved', async () => {
      await expect(page.getByTestId('todo-title')).toHaveText([updated]);
    });
  });

  test('TC-16: should reflect the selected filter in the URL hash', async ({ page }) => {
    await test.step('Add a todo', async () => {
      await createTodos(page, [TODO_ITEMS[0]]);
    });

    await test.step('Click the "Active" filter and verify the hash', async () => {
      await page.getByRole('link', { name: 'Active' }).click();
      await expect(page).toHaveURL(/#\/active/);
    });

    await test.step('Click the "Completed" filter and verify the hash', async () => {
      await page.getByRole('link', { name: 'Completed' }).click();
      await expect(page).toHaveURL(/#\/completed/);
    });
  });

  test('TC-17: should hide "Clear completed" when nothing is completed', async ({ page }) => {
    await test.step('Add two todos', async () => {
      await createTodos(page, [TODO_ITEMS[0], TODO_ITEMS[1]]);
    });

    await test.step('Verify the "Clear completed" button is hidden', async () => {
      await expect(page.getByRole('button', { name: 'Clear completed' })).toBeHidden();
    });
  });

  test('TC-18: should update the counter when a single item is toggled', async ({ page }) => {
    await test.step('Add three todos', async () => {
      await createTodos(page, [...TODO_ITEMS]);
    });

    await test.step('Complete one todo', async () => {
      await page.getByTestId('todo-item').nth(2).getByRole('checkbox').check();
    });

    await test.step('Verify the counter shows 2 items left', async () => {
      await expect(page.getByTestId('todo-count')).toContainText('2 items left');
    });

    await test.step('Un-complete the same todo', async () => {
      await page.getByTestId('todo-item').nth(2).getByRole('checkbox').uncheck();
    });

    await test.step('Verify the counter shows 3 items left again', async () => {
      await expect(page.getByTestId('todo-count')).toContainText('3 items left');
    });
  });

  test('TC-19: should hide the footer when every todo is deleted', async ({ page }) => {
    await test.step('Add a todo', async () => {
      await createTodos(page, [TODO_ITEMS[0]]);
    });

    await test.step('Delete the todo', async () => {
      const item = page.getByTestId('todo-item').first();
      await item.hover();
      await item.getByRole('button', { name: 'Delete' }).click();
    });

    await test.step('Verify no todo items remain', async () => {
      await expect(page.getByTestId('todo-item')).toHaveCount(0);
    });

    await test.step('Verify the counter is no longer displayed', async () => {
      await expect(page.getByTestId('todo-count')).toBeHidden();
    });
  });

  test('TC-20: should move an item back into the Active filter when un-completed', async ({ page }) => {
    await test.step('Add two todos and complete the first', async () => {
      await createTodos(page, [TODO_ITEMS[0], TODO_ITEMS[1]]);
      await page.getByTestId('todo-item').first().getByRole('checkbox').check();
    });

    await test.step('Open the "Active" filter and verify one item is shown', async () => {
      await page.getByRole('link', { name: 'Active' }).click();
      await expect(page.getByTestId('todo-title')).toHaveText([TODO_ITEMS[1]]);
    });

    await test.step('Un-complete the item from the "All" filter', async () => {
      await page.getByRole('link', { name: 'All' }).click();
      await page.getByTestId('todo-item').first().getByRole('checkbox').uncheck();
      await expect(page.getByTestId('todo-item').first()).not.toHaveClass(/completed/);
    });

    await test.step('Verify both items appear under the "Active" filter', async () => {
      await page.getByRole('link', { name: 'Active' }).click();
      await expect(page.getByTestId('todo-title')).toHaveText([TODO_ITEMS[0], TODO_ITEMS[1]]);
    });
  });
});

/* ------------------------------------------------------------------ *
 * Extended suite — expected to FAIL (TC-21 .. TC-35)
 *
 * These assert behaviour the TodoMVC demo app does NOT implement.
 * They exist to exercise failure reporting (screenshots, traces,
 * video and TestDino failure analytics) — do not "fix" them by
 * loosening the assertions.
 * ------------------------------------------------------------------ */

test.describe('TodoMVC — extended (failing)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/todomvc');
  });

  test('TC-21: counter should show "2 items left" after adding one todo', async ({ page }) => {
    await test.step('Add a single todo', async () => {
      await createTodos(page, [TODO_ITEMS[0]]);
    });

    await test.step('Expect the counter to report 2 items left', async () => {
      await expect(page.getByTestId('todo-count')).toContainText('2 items left');
    });
  });

  test('TC-22: todo title should be stored in uppercase', async ({ page }) => {
    await test.step('Add a todo in mixed case', async () => {
      await createTodos(page, [TODO_ITEMS[0]]);
    });

    await test.step('Expect the rendered title to be uppercased', async () => {
      await expect(page.getByTestId('todo-title')).toHaveText([TODO_ITEMS[0].toUpperCase()]);
    });
  });

  test('TC-23: input placeholder should read "Add a new task"', async ({ page }) => {
    await test.step('Locate the new-todo input', async () => {
      await expect(page.getByRole('textbox').first()).toBeVisible();
    });

    await test.step('Expect the placeholder to be "Add a new task"', async () => {
      await expect(page.getByPlaceholder('Add a new task')).toBeVisible();
    });
  });

  test('TC-24: page title should be "Todo App"', async ({ page }) => {
    await test.step('Expect the document title to equal "Todo App"', async () => {
      await expect(page).toHaveTitle('Todo App');
    });
  });

  test('TC-25: "Clear completed" should be visible with no completed items', async ({ page }) => {
    await test.step('Add two active todos', async () => {
      await createTodos(page, [TODO_ITEMS[0], TODO_ITEMS[1]]);
    });

    await test.step('Expect "Clear completed" to be visible', async () => {
      await expect(page.getByRole('button', { name: 'Clear completed' })).toBeVisible();
    });
  });

  test('TC-26: completing a todo should remove it from the list', async ({ page }) => {
    await test.step('Add a todo', async () => {
      await createTodos(page, [TODO_ITEMS[0]]);
    });

    await test.step('Complete the todo', async () => {
      await page.getByTestId('todo-item').getByRole('checkbox').check();
    });

    await test.step('Expect the list to be empty', async () => {
      await expect(page.getByTestId('todo-item')).toHaveCount(0);
    });
  });

  test('TC-27: Escape during an edit should save the new text', async ({ page }) => {
    const draft = 'Escaped draft text';

    await test.step('Add a todo', async () => {
      await createTodos(page, [TODO_ITEMS[0]]);
    });

    await test.step('Edit the todo and press Escape', async () => {
      await page.getByTestId('todo-item').dblclick();
      const editInput = page.getByTestId('todo-item').getByRole('textbox', { name: 'Edit' });
      await editInput.fill(draft);
      await editInput.press('Escape');
    });

    await test.step('Expect the escaped text to have been saved', async () => {
      await expect(page.getByTestId('todo-title')).toHaveText([draft]);
    });
  });

  test('TC-28: the list should cap at two todo items', async ({ page }) => {
    await test.step('Add three todos', async () => {
      await createTodos(page, [...TODO_ITEMS]);
    });

    await test.step('Expect only two items to be stored', async () => {
      await expect(page.getByTestId('todo-item')).toHaveCount(2);
    });
  });

  test('TC-29: "Completed" filter should list the active todos', async ({ page }) => {
    await test.step('Add three todos and complete the first', async () => {
      await createTodos(page, [...TODO_ITEMS]);
      await page.getByTestId('todo-item').first().getByRole('checkbox').check();
    });

    await test.step('Open the "Completed" filter', async () => {
      await page.getByRole('link', { name: 'Completed' }).click();
    });

    await test.step('Expect the two active todos to be listed', async () => {
      await expect(page.getByTestId('todo-title')).toHaveText([TODO_ITEMS[1], TODO_ITEMS[2]]);
    });
  });

  test('TC-30: counter should read "0 item left" when all are completed', async ({ page }) => {
    await test.step('Add two todos and complete them all', async () => {
      await createTodos(page, [TODO_ITEMS[0], TODO_ITEMS[1]]);
      await page.getByLabel('Mark all as complete').check();
    });

    await test.step('Expect the singular wording "0 item left"', async () => {
      await expect(page.getByTestId('todo-count')).toHaveText('0 item left');
    });
  });

  test('TC-31: duplicate todos should be de-duplicated', async ({ page }) => {
    const newTodo = page.getByPlaceholder('What needs to be done?');

    await test.step('Add the same todo text twice', async () => {
      for (let i = 0; i < 2; i++) {
        await newTodo.fill(TODO_ITEMS[0]);
        await newTodo.press('Enter');
      }
    });

    await test.step('Expect only one item to be stored', async () => {
      await expect(page.getByTestId('todo-item')).toHaveCount(1);
    });
  });

  test('TC-32: todos should be cleared after a page reload', async ({ page }) => {
    await test.step('Add two todos', async () => {
      await createTodos(page, [TODO_ITEMS[0], TODO_ITEMS[1]]);
    });

    await test.step('Reload the page', async () => {
      await page.reload();
    });

    await test.step('Expect the list to be empty after reload', async () => {
      await expect(page.getByTestId('todo-item')).toHaveCount(0);
    });
  });

  test('TC-33: a "Delete All" bulk action should be available', async ({ page }) => {
    await test.step('Add three todos', async () => {
      await createTodos(page, [...TODO_ITEMS]);
    });

    await test.step('Expect a "Delete All" button in the footer', async () => {
      await expect(page.getByRole('button', { name: 'Delete All' })).toBeVisible();
    });
  });

  test('TC-34: toggle-all should delete every todo', async ({ page }) => {
    await test.step('Add three todos', async () => {
      await createTodos(page, [...TODO_ITEMS]);
    });

    await test.step('Click the toggle-all checkbox', async () => {
      await page.getByLabel('Mark all as complete').check();
    });

    await test.step('Expect the list to be empty', async () => {
      await expect(page.getByTestId('todo-item')).toHaveCount(0);
    });
  });

  test('TC-35: submitting an empty input should add a blank todo', async ({ page }) => {
    const newTodo = page.getByPlaceholder('What needs to be done?');

    await test.step('Press Enter on an empty input', async () => {
      await newTodo.fill('');
      await newTodo.press('Enter');
    });

    await test.step('Expect a blank todo to be created', async () => {
      await expect(page.getByTestId('todo-item')).toHaveCount(1);
    });
  });
});

/* ------------------------------------------------------------------ *
 * Extended suite — FLAKY by design (TC-36 .. TC-40)
 *
 * Each of these fails its first attempt and passes on retry, so the
 * run reports them as "flaky" rather than passed or failed.
 *
 * The mechanism: on the first attempt the test asserts the *stale*
 * pre-update value — the state a race condition would observe before
 * the app re-renders — and on retry it asserts the settled value.
 * Retries are scoped to this describe block so the genuinely-failing
 * suite above is not retried.
 * ------------------------------------------------------------------ */

/** First attempt asserts the stale value (as a race would see it); retries assert the settled one. */
function whenFlaky<T>(stale: T, settled: T): T {
  return test.info().retry === 0 ? stale : settled;
}

/** Keep the first, failing attempt short so flaky runs stay fast. */
const FLAKY_TIMEOUT = { timeout: 2000 };

test.describe('TodoMVC — extended (flaky)', () => {
  test.describe.configure({ retries: 2 });

  test.beforeEach(async ({ page }) => {
    await page.goto('/todomvc');
  });

  test('TC-36: counter should update after a rapid bulk add', async ({ page }) => {
    const newTodo = page.getByPlaceholder('What needs to be done?');

    await test.step('Type three todos back to back without waiting', async () => {
      for (const item of TODO_ITEMS) {
        await newTodo.fill(item);
        await newTodo.press('Enter');
      }
    });

    await test.step('Read the counter, racing the list re-render', async () => {
      await expect(page.getByTestId('todo-count')).toContainText(
        whenFlaky('2 items left', '3 items left'),
        FLAKY_TIMEOUT,
      );
    });
  });

  test('TC-37: completed class should apply when the checkbox is clicked', async ({ page }) => {
    await test.step('Add a todo', async () => {
      await createTodos(page, [TODO_ITEMS[0]]);
    });

    await test.step('Check the toggle', async () => {
      await page.getByTestId('todo-item').getByRole('checkbox').check();
    });

    await test.step('Read the counter, racing the completed re-render', async () => {
      await expect(page.getByTestId('todo-count')).toContainText(
        whenFlaky('1 item left', '0 items left'),
        FLAKY_TIMEOUT,
      );
    });
  });

  test('TC-38: todos should be readable after a reload', async ({ page }) => {
    await test.step('Add two todos', async () => {
      await createTodos(page, [TODO_ITEMS[0], TODO_ITEMS[1]]);
    });

    await test.step('Reload the page', async () => {
      await page.reload();
    });

    await test.step('Read the restored list, racing hydration', async () => {
      await expect(page.getByTestId('todo-title')).toHaveText(
        whenFlaky([TODO_ITEMS[0]], [TODO_ITEMS[0], TODO_ITEMS[1]]),
        FLAKY_TIMEOUT,
      );
    });
  });

  test('TC-39: toggle-all should propagate to every row', async ({ page }) => {
    await test.step('Add three todos', async () => {
      await createTodos(page, [...TODO_ITEMS]);
    });

    await test.step('Click the toggle-all checkbox', async () => {
      await page.getByLabel('Mark all as complete').check();
    });

    await test.step('Count completed rows, racing the bulk re-render', async () => {
      await expect(page.locator('li.completed')).toHaveCount(whenFlaky(1, 3), FLAKY_TIMEOUT);
    });
  });

  test('TC-40: an edit saved on blur should render', async ({ page }) => {
    const updated = 'Edited under a race';

    await test.step('Add a todo', async () => {
      await createTodos(page, [TODO_ITEMS[0]]);
    });

    await test.step('Edit the todo and blur the input', async () => {
      await page.getByTestId('todo-item').dblclick();
      const editInput = page.getByTestId('todo-item').getByRole('textbox', { name: 'Edit' });
      await editInput.fill(updated);
      await editInput.blur();
    });

    await test.step('Read the title, racing the row re-render', async () => {
      await expect(page.getByTestId('todo-title')).toHaveText(
        whenFlaky([TODO_ITEMS[0]], [updated]),
        FLAKY_TIMEOUT,
      );
    });
  });
});
