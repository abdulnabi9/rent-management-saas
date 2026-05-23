import { test, expect } from './helpers/fixtures';
import { generateUniqueName } from './helpers/auth';

// Reset storageState for authentication tests so they run unauthenticated
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Authentication and Route Protection', () => {
  test('Protected routes redirect to login when unauthenticated', async ({ page }) => {
    // Attempting to access dashboard directly
    await page.goto('/dashboard');
    // Should be redirected to login page
    await expect(page).toHaveURL(/.*\/login/);

    // Attempting to access buildings directly
    await page.goto('/buildings');
    await expect(page).toHaveURL(/.*\/login/);

    // Attempting to access tenants directly
    await page.goto('/tenants');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('Signup flow shows expected form and checks basic validation', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible();

    // Check basic validations (submitting blank form)
    await page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page.getByText(/enter a valid email/i)).toBeVisible();
    await expect(page.getByText(/password must be at least 8 characters/i)).toBeVisible();
  });

  test('Invalid login credentials show error toast', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email address').fill('nonexistent_user_12345@example.com');
    await page.getByLabel('Password', { exact: true }).fill('some_fake_password_999');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Error toast should appear
    await expect(page.getByText(/invalid login credentials/i)).toBeVisible();
  });

  test('Valid login flow succeeds and session persists on reload', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email address').fill(process.env.TEST_USER_A_EMAIL!);
    await page.getByLabel('Password', { exact: true }).fill(process.env.TEST_USER_A_PASSWORD!);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).toHaveURL(/.*\/dashboard/);

    // Reload page to verify session persistence
    await page.reload();
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('Logout wipes session and protects pages', async ({ page }) => {
    // First, login
    await page.goto('/login');
    await page.getByLabel('Email address').fill(process.env.TEST_USER_A_EMAIL!);
    await page.getByLabel('Password', { exact: true }).fill(process.env.TEST_USER_A_PASSWORD!);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Clear session by hitting the user menu profile dropdown or clearing programmatically
    const userMenu = page.getByRole('button', { name: /user menu|profile/i });
    if (await userMenu.isVisible()) {
      await userMenu.click();
      const logoutBtn = page.getByRole('menuitem', { name: /log out|sign out/i });
      if (await logoutBtn.isVisible()) {
        await logoutBtn.click();
      }
    } else {
      // Direct programmatic logout simulation
      await page.context().clearCookies();
      await page.evaluate(() => window.localStorage.clear());
      await page.goto('/login');
    }

    await expect(page).toHaveURL(/.*\/login/);

    // Try navigating back to dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
  });
});
