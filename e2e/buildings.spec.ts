import { test, expect } from './helpers/fixtures';
import { generateUniqueName } from './helpers/auth';
import { createBuilding, cleanupAllTestBuildings } from './helpers/test-utils';

test.describe.serial('Buildings CRUD Operations', () => {
  const buildingName = generateUniqueName('CRUDTest Building');
  const updatedName = `${buildingName} (Edited)`;

  test.afterAll(async ({ page }) => {
    // Make sure we authenticate User A context for cleanup
    await cleanupAllTestBuildings(page);
  });

  test('Validation checks on empty building form', async ({ page }) => {
    await page.goto('/buildings');
    await page.getByRole('button', { name: /add building/i }).click();

    // Click submit without entering anything
    await page.getByRole('button', { name: 'Add Building', exact: true }).click();

    // Verify zod validation errors are shown on UI
    await expect(page.locator('form p.text-red-500').first()).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();
  });

  test('Create a new building', async ({ page }) => {
    await createBuilding(page, buildingName, '789 E2E Street', 4, 12, 'Automated Test Building');

    // Verify it is listed in the main page
    await page.goto('/buildings');
    await expect(page.getByRole('heading', { name: buildingName })).toBeVisible();
  });

  test('Edit/Update existing building', async ({ page }) => {
    await page.goto('/buildings');

    // Locate the card of the created building
    const card = page.locator('div.bg-white', {
      has: page.getByRole('heading', { name: buildingName })
    }).first();

    // Click dropdown toggle
    await card.locator('button').first().click();

    // Click Edit menu item
    await page.getByRole('menuitem', { name: /edit/i }).click();

    // Fill new name and save
    await page.getByLabel('Building Name *').fill(updatedName);
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // Verify success toast
    await expect(page.getByText('Building updated!')).toBeVisible();

    // Verify updated heading is visible
    await expect(page.getByRole('heading', { name: updatedName })).toBeVisible();
  });

  test('Delete building', async ({ page }) => {
    await page.goto('/buildings');

    // Locate card of the edited building
    const card = page.locator('div.bg-white', {
      has: page.getByRole('heading', { name: updatedName })
    }).first();

    // Click dropdown
    await card.locator('button').first().click();

    // Click Delete
    await page.getByRole('menuitem', { name: /delete/i }).click();

    // Click Confirm on dialog
    await page.getByRole('button', { name: 'Confirm' }).click();

    // Verify success toast
    await expect(page.getByText('Building deleted')).toBeVisible();

    // Verify card is no longer visible
    await expect(page.getByRole('heading', { name: updatedName })).not.toBeVisible();
  });
});
