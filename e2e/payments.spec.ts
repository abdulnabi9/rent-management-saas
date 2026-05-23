import { test, expect } from './helpers/fixtures';
import { generateUniqueName } from './helpers/auth';
import { createBuilding, createRoom, createTenant, createRentPayment, cleanupAllTestBuildings } from './helpers/test-utils';

test.describe.serial('Rent Payments CRUD Operations', () => {
  const buildingName = generateUniqueName('CRUDPayments Building');
  const roomNo = '505P';
  const tenantName = generateUniqueName('CRUDPayment Tenant');
  const rentAmount = 7500;

  test.beforeAll(async ({ page }) => {
    // Setup building, room, and active tenant
    await createBuilding(page, buildingName, 'Rent Collector Way', 1, 2);
    await createRoom(page, buildingName, roomNo, 1, 'single', 1, rentAmount, 'vacant');
    await createTenant(page, tenantName, '+91 9777766666', new Date().toISOString().split('T')[0], buildingName, roomNo, 15000, 'active');
  });

  test.afterAll(async ({ page }) => {
    // Purges parent building which cascades to wipe rooms, tenants, and rent payments
    await cleanupAllTestBuildings(page);
  });

  test('Record a rent payment', async ({ page }) => {
    await createRentPayment(page, tenantName, rentAmount, new Date().getMonth() + 1, new Date().getFullYear(), 'paid');

    // Verify it is displayed in the rent collection table
    await page.goto('/rent');
    await expect(page.getByRole('cell', { name: tenantName })).toBeVisible();
    await expect(page.getByRole('cell', { name: `₹${rentAmount.toLocaleString('en-IN')}` })).toBeVisible();
    
    // Paid status badge
    await expect(page.locator('tr', { hasText: tenantName }).getByText('paid', { exact: true })).toBeVisible();
  });

  test('Edit payment details and status', async ({ page }) => {
    await page.goto('/rent');

    const row = page.locator('tr', {
      hasText: tenantName
    }).first();

    // Click Edit button
    await row.getByRole('button', { name: 'Edit' }).click();

    // Change status to unpaid
    await page.locator('label:has-text("Status") + div button, label:has-text("Status") + button').click();
    await page.getByRole('option', { name: 'Unpaid' }).click();

    // Save
    await page.getByRole('button', { name: 'Update', exact: true }).click();
    await expect(page.getByText('Payment updated!')).toBeVisible();

    // Verify status has updated to unpaid
    await expect(page.locator('tr', { hasText: tenantName }).getByText('unpaid', { exact: true })).toBeVisible();
  });
});
