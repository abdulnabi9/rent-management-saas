import { test, expect } from './helpers/fixtures';
import { generateUniqueName } from './helpers/auth';
import { createBuilding, createExpense, cleanupAllTestBuildings } from './helpers/test-utils';

test.describe.serial('Expenses CRUD Operations', () => {
  const buildingName = generateUniqueName('CRUDExpenses Building');
  const expenseAmount = 3500;
  const updatedAmount = 4200;

  test.beforeAll(async ({ page }) => {
    // Expense needs to belong to a building
    await createBuilding(page, buildingName, 'Expense Avenue', 1, 1);
  });

  test.afterAll(async ({ page }) => {
    // Purges building and related expenses
    await cleanupAllTestBuildings(page);
  });

  test('Create an expense', async ({ page }) => {
    await createExpense(page, buildingName, 'electricity', expenseAmount, new Date().toISOString().split('T')[0], 'Electricity for testing');

    // Verify it is listed in the expenses table
    await page.goto('/expenses');
    await expect(page.getByRole('cell', { name: buildingName })).toBeVisible();
    await expect(page.getByRole('cell', { name: `₹${expenseAmount.toLocaleString('en-IN')}` })).toBeVisible();
  });

  test('Edit expense details and category', async ({ page }) => {
    await page.goto('/expenses');

    // Locate the row for our building
    const row = page.locator('tr', {
      hasText: buildingName
    }).first();

    // Click row menu trigger
    await row.locator('button').first().click();
    await page.getByRole('menuitem', { name: /edit/i }).click();

    // Modify amount
    await page.getByLabel('Amount (₹) *').fill(String(updatedAmount));

    // Save
    await page.getByRole('button', { name: 'Save Changes', exact: true }).click();
    await expect(page.getByText('Expense updated!')).toBeVisible();

    // Verify updated amount is shown in table
    await expect(page.getByRole('cell', { name: `₹${updatedAmount.toLocaleString('en-IN')}` })).toBeVisible();
  });

  test('Delete expense', async ({ page }) => {
    await page.goto('/expenses');

    const row = page.locator('tr', {
      hasText: buildingName
    }).first();

    // Click row dropdown
    await row.locator('button').first().click();
    await page.getByRole('menuitem', { name: /delete/i }).click();

    // Confirm dialog
    await page.getByRole('button', { name: 'Confirm' }).click();

    // Verify success toast
    await expect(page.getByText('Expense deleted')).toBeVisible();

    // Verify row is gone
    await expect(page.getByRole('cell', { name: buildingName })).not.toBeVisible();
  });
});
