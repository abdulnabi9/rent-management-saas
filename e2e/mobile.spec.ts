import { test, expect } from './helpers/fixtures';

test.describe('Mobile Viewport & Responsiveness', () => {
  // Mobile specific UI verification
  test('Bottom Navigation is visible and functional on mobile viewports', async ({ page, isMobile }) => {
    // Only run this test if we are actually emulating a mobile device
    if (!isMobile) {
      test.skip();
    }

    await page.goto('/dashboard');

    // Bottom Navigation should be visible
    const bottomNav = page.locator('nav.fixed.bottom-0');
    await expect(bottomNav).toBeVisible();

    // Verify nav links exist
    await expect(bottomNav.getByText('Home', { exact: true })).toBeVisible();
    await expect(bottomNav.getByText('Builds', { exact: true })).toBeVisible();
    await expect(bottomNav.getByText('Profile', { exact: true })).toBeVisible();

    // Navigate using Bottom Nav
    await bottomNav.getByText('Builds', { exact: true }).click();
    await expect(page).toHaveURL(/.*\/buildings/);

    // Sidebar should be hidden
    const sidebar = page.locator('aside.hidden.md\\:flex');
    await expect(sidebar).not.toBeVisible();
  });

  test('Form layouts do not overflow horizontally on mobile', async ({ page, isMobile }) => {
    if (!isMobile) test.skip();

    await page.goto('/buildings');
    // Open a modal to check responsive padding
    await page.getByRole('button', { name: /Add Building/i }).click();
    
    // Verify dialog content is within viewport width
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    
    const boundingBox = await dialog.boundingBox();
    const viewportSize = page.viewportSize();
    
    if (boundingBox && viewportSize) {
      expect(boundingBox.width).toBeLessThanOrEqual(viewportSize.width);
    }
  });
});
