import { test, expect } from './helpers/fixtures';
import { generateUniqueName, logout } from './helpers/auth';
import { createBuilding, createRoom, createTenant, cleanupAllTestBuildings } from './helpers/test-utils';

test.describe.serial('Multi-Tenant Data Isolation', () => {
  // Use unique names to avoid collisions and check explicitly
  const buildingNameA = generateUniqueName('IsolationTest Building A');
  const roomNoA = '101A';
  const tenantNameA = generateUniqueName('IsolationTest Tenant A');

  const buildingNameB = generateUniqueName('IsolationTest Building B');
  const roomNoB = '202B';
  const tenantNameB = generateUniqueName('IsolationTest Tenant B');

  test('Step 1-3: User A creates data, and logs out', async ({ page }) => {
    // Authenticated state is User A by default in the project config
    await page.goto('/dashboard');
    
    // Create building + room + tenant as User A
    await createBuilding(page, buildingNameA, 'User A Street', 2, 4, 'User A Notes');
    await createRoom(page, buildingNameA, roomNoA, 1, 'single', 1, 6000, 'vacant');
    await createTenant(page, tenantNameA, '+91 9999911111', new Date().toISOString().split('T')[0], buildingNameA, roomNoA, 12000, 'active');

    // Confirm visible to User A
    await page.goto('/buildings');
    await expect(page.getByRole('heading', { name: buildingNameA })).toBeVisible();

    await page.goto('/rooms');
    await expect(page.getByText(`Room ${roomNoA}`)).toBeVisible();

    await page.goto('/tenants');
    await expect(page.getByText(tenantNameA)).toBeVisible();

    // Logout
    await logout(page);
  });

  test('Step 4-7: User B logs in, verifies isolation, creates User B data, and logs out', async ({ browser }) => {
    // Open a fresh context with User B's storage state
    const contextB = await browser.newContext({ storageState: 'e2e/.auth/userB.json' });
    const pageB = await contextB.newPage();

    // Verify isolation: User B cannot see User A's data
    await pageB.goto('/buildings');
    await expect(pageB.getByRole('heading', { name: buildingNameA })).not.toBeVisible();

    await pageB.goto('/rooms');
    await expect(pageB.getByText(`Room ${roomNoA}`)).not.toBeVisible();

    await pageB.goto('/tenants');
    await expect(pageB.getByText(tenantNameA)).not.toBeVisible();

    // Create User B's data
    await createBuilding(pageB, buildingNameB, 'User B Ave', 3, 6, 'User B Notes');
    await createRoom(pageB, buildingNameB, roomNoB, 2, 'shared', 2, 4000, 'vacant');
    await createTenant(pageB, tenantNameB, '+91 9999922222', new Date().toISOString().split('T')[0], buildingNameB, roomNoB, 8000, 'active');

    // Verify User B's data exists for User B
    await pageB.goto('/buildings');
    await expect(pageB.getByRole('heading', { name: buildingNameB })).toBeVisible();

    // Clean up User B's data
    await cleanupAllTestBuildings(pageB);

    await contextB.close();
  });

  test('Step 8-10: User A logs back in, verifies User A cannot see User B data, then cleans up', async ({ page }) => {
    // Go to login page first to authenticate User A again (since previous test logged out)
    await page.goto('/login');
    await page.getByLabel('Email address').fill(process.env.TEST_USER_A_EMAIL!);
    await page.getByLabel('Password', { exact: true }).fill(process.env.TEST_USER_A_PASSWORD!);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Verify User A cannot see User B's data
    await page.goto('/buildings');
    await expect(page.getByRole('heading', { name: buildingNameB })).not.toBeVisible();

    await page.goto('/rooms');
    await expect(page.getByText(`Room ${roomNoB}`)).not.toBeVisible();

    await page.goto('/tenants');
    await expect(page.getByText(tenantNameB)).not.toBeVisible();

    // Clean up User A's data
    await cleanupAllTestBuildings(page);
  });
});
