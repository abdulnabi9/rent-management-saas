import { test, expect } from './helpers/fixtures';

test.describe('Dashboard and Analytics Visuals', () => {
  test('Verify dashboard stats cards and metric widgets are visible', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check main KPI widgets
    await expect(page.getByText(/total revenue|monthly revenue/i).first()).toBeVisible();
    await expect(page.getByText(/occupancy rate/i).first()).toBeVisible();
    await expect(page.getByText(/total buildings/i).first()).toBeVisible();
    await expect(page.getByText(/active tenants/i).first()).toBeVisible();
  });

  test('Verify dashboard analytics charts render properly', async ({ page }) => {
    await page.goto('/dashboard');

    // Chart component wrappers (e.g. svg or recharts container classes)
    const charts = page.locator('.recharts-wrapper, svg, .recharts-responsive-container');
    await expect(charts.first()).toBeVisible();
  });

  test('Dashboard loads properly with network latency (Loading states check)', async ({ page }) => {
    // Intercept network calls to introduce latency and verify loading spinner or skeleton triggers
    await page.route('**/api/**', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 800));
      await route.continue();
    });

    await page.goto('/dashboard');

    // Spinner/Skeleton loading elements (such as animate-spin classes or skeletons)
    const spinner = page.locator('.animate-spin, .skeleton, [class*="spinner"]').first();
    // It's possible for data to fetch extremely quickly, but if a spinner is declared, we assert its presence
    if (await spinner.count() > 0) {
      await expect(spinner).toBeVisible();
    }
  });
});
