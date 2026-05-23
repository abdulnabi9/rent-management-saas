import { test, expect } from './helpers/fixtures';
import { generateUniqueName } from './helpers/auth';
import { createBuilding, createRoom, cleanupAllTestBuildings } from './helpers/test-utils';

test.describe.serial('Rooms CRUD Operations', () => {
  const buildingName = generateUniqueName('CRUDRooms Building');
  const roomNo = '303R';
  const updatedRoomNo = '303R-Edited';

  test.beforeAll(async ({ page }) => {
    // We need a parent building to host our test rooms
    await createBuilding(page, buildingName, 'Room Test Boulevard', 2, 4);
  });

  test.afterAll(async ({ page }) => {
    // Make sure we clean up the hosting building which deletes all test rooms automatically
    await cleanupAllTestBuildings(page);
  });

  test('Create a room', async ({ page }) => {
    await createRoom(page, buildingName, roomNo, 1, 'single', 1, 4500, 'vacant');

    // Verify room is displayed in the list
    await page.goto('/rooms');
    await expect(page.getByRole('heading', { name: `Room ${roomNo}` })).toBeVisible();
  });

  test('Edit room number and occupancy status', async ({ page }) => {
    await page.goto('/rooms');

    const card = page.locator('div.bg-white', {
      hasText: `Room ${roomNo}`
    }).first();

    // Click dropdown toggle
    await card.locator('button').first().click();
    await page.getByRole('menuitem', { name: /edit/i }).click();

    // Modify room number
    await page.getByLabel('Room Number *').fill(updatedRoomNo);

    // Modify status
    await page.locator('label:has-text("Status *") + div button, label:has-text("Status *") + button').click();
    await page.getByRole('option', { name: 'Maintenance' }).click();

    // Save
    await page.getByRole('button', { name: 'Save Changes', exact: true }).click();
    await expect(page.getByText('Room updated!')).toBeVisible();

    // Verify changes
    await expect(page.getByRole('heading', { name: `Room ${updatedRoomNo}` })).toBeVisible();
    await expect(page.getByText('maintenance').first()).toBeVisible();
  });

  test('Delete room', async ({ page }) => {
    await page.goto('/rooms');

    const card = page.locator('div.bg-white', {
      hasText: `Room ${updatedRoomNo}`
    }).first();

    // Click dropdown
    await card.locator('button').first().click();
    await page.getByRole('menuitem', { name: /delete/i }).click();

    // Confirm dialog
    await page.getByRole('button', { name: 'Confirm' }).click();

    // Success toast
    await expect(page.getByText('Room deleted')).toBeVisible();

    // Verify it is gone
    await expect(page.getByRole('heading', { name: `Room ${updatedRoomNo}` })).not.toBeVisible();
  });
});
