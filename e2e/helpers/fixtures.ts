import { test as base } from '@playwright/test';

// Extend the base test with automatic console error tracking
export const test = base.extend({
  page: async ({ page }, use) => {
    const errors: string[] = [];

    // Listen for uncaught exceptions in the browser
    page.on('pageerror', (err) => {
      errors.push(`Page Error: ${err.message}`);
    });

    // Listen for console.error messages (like Hydration errors)
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore expected/ignorable errors if necessary, but trap critical React/Next ones
        if (
          text.includes('Hydration failed') ||
          text.includes('Minified React error') ||
          text.includes('Text content does not match server-rendered HTML') ||
          text.includes('Warning: Expected server HTML to contain')
        ) {
          errors.push(`Hydration/React Error: ${text}`);
        } else {
          // You can also capture ALL console errors, but some might be normal (like 404s on favicons or intentional 401s in auth tests)
          // For strictness as requested, let's capture significant errors or log them.
          // For now, we specifically strictly fail on hydration/React mismatches as requested.
        }
      }
    });

    // Use the augmented page in the test
    await use(page);

    // After test finishes, assert no critical runtime/hydration errors occurred
    if (errors.length > 0) {
      throw new Error(`Test failed due to critical browser errors:\n${errors.join('\n')}`);
    }
  },
});

export { expect } from '@playwright/test';
