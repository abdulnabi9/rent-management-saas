import { test, expect } from './helpers/fixtures';
import { generateUniqueName } from './helpers/auth';
import { createBuilding, createRoom, createTenant, cleanupAllTestBuildings } from './helpers/test-utils';

test.describe.serial('Tenants CRUD Operations', () => {
  const buildingName = generateUniqueName('CRUDTenants Building');
  const roomNo = '404T';
  const tenantName = generateUniqueName('CRUDTenant Name');
  const updatedTenantName = `${tenantName} (Edited)`;

  test.beforeAll(async ({ page }) => {
    // Setup building and room to host the tenant
    await createBuilding(page, buildingName, 'Tenant Test Street', 1, 2);
    await createRoom(page, buildingName, roomNo, 1, 'single', 1, 8000, 'vacant');
  });

  test.afterAll(async ({ page }) => {
    // Purges building, room, and tenant
    await cleanupAllTestBuildings(page);
  });

  test('Create a tenant and assign room', async ({ page }) => {
    await createTenant(page, tenantName, '+91 9888877777', new Date().toISOString().split('T')[0], buildingName, roomNo, 16000, 'active');

    // Verify tenant exists on list
    await page.goto('/tenants');
    await expect(page.getByRole('heading', { name: tenantName })).toBeVisible();
    await expect(page.getByText(`Room ${roomNo}`)).toBeVisible();
  });

  test('Update tenant details', async ({ page }) => {
    await page.goto('/tenants');

    const card = page.locator('div.bg-white', {
      hasText: tenantName
    }).first();

    // Open dropdown and click Edit
    await card.locator('button').first().click();
    await page.getByRole('menuitem', { name: /edit/i }).click();

    // Edit Name
    await page.getByLabel('Full Name *').fill(updatedTenantName);

    // Save Changes
    await page.getByRole('button', { name: 'Save Changes', exact: true }).click();
    await expect(page.getByText('Tenant updated!')).toBeVisible();

    // Verify new name
    await expect(page.getByRole('heading', { name: updatedTenantName })).toBeVisible();
  });

  test('Delete tenant', async ({ page }) => {
    await page.goto('/tenants');

    const card = page.locator('div.bg-white', {
      hasText: updatedTenantName
    }).first();

    // Open dropdown and delete
    await card.locator('button').first().click();
    await page.getByRole('menuitem', { name: /remove/i }).click();

    // Confirm removal
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByText('Tenant removed')).toBeVisible();

    // Verify gone
    await expect(page.getByRole('heading', { name: updatedTenantName })).not.toBeVisible();
  });
});
