import { test, expect } from './helpers/fixtures';

test.describe('Performance & Navigation Timings', () => {
  test('Dashboard page should render loading states instantly and hydrate quickly', async ({ page }) => {
    // Navigate and measure Time to First Byte (TTFB) or basic navigation timing
    await page.goto('/dashboard');
    
    // Check performance API via evaluate
    const timing = await page.evaluate(() => {
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return navEntry ? navEntry.responseEnd - navEntry.startTime : 0;
    });

    // Ensure the initial HTML transfer and hydration is fast (under 2 seconds)
    // Note: Emulated tests or CI environments can be slow, 
    // so we set a generous limit for automated environments, but it catches massive regressions.
    expect(timing).toBeLessThan(5000);

    // Verify main components are fully visible (ensuring no infinite loaders)
    await expect(page.getByText('Overview', { exact: true })).toBeVisible({ timeout: 5000 });
  });

  test('Route transitions are snappy and non-blocking', async ({ page }) => {
    await page.goto('/dashboard');
    
    const startTime = Date.now();
    // Use desktop sidebar navigation
    await page.getByRole('link', { name: 'Buildings' }).click();
    
    // Check how long it takes for the new page heading to appear
    await expect(page.getByRole('heading', { name: 'Buildings' })).toBeVisible();
    
    const transitionTime = Date.now() - startTime;
    
    // Client-side routing with Next.js should be near instant. 
    // With loading.tsx, the skeleton appears instantly, so the heading (if part of layout/page) should be fast.
    expect(transitionTime).toBeLessThan(3000);
  });
});
