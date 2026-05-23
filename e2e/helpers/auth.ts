import { Page, expect } from '@playwright/test';

export async function login(page: Page, email: string, password: string = 'password123') {
  await page.goto('/login');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL(/.*\/dashboard/);
}

export async function logout(page: Page) {
  await page.goto('/dashboard');
  
  // Try using the user profile menu to sign out
  const userMenu = page.getByRole('button', { name: /user menu|profile/i });
  if (await userMenu.isVisible()) {
    await userMenu.click();
    const logoutBtn = page.getByRole('menuitem', { name: /log out|sign out/i });
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await expect(page).toHaveURL(/.*\/login/);
      return;
    }
  }

  // Fallback: search for any logout button/link or directly clear storage/cookies
  const fallbackLogout = page.locator('button:has-text("Log out"), button:has-text("Sign out"), a:has-text("Log out"), a:has-text("Sign out")').first();
  if (await fallbackLogout.isVisible()) {
    await fallbackLogout.click();
    await expect(page).toHaveURL(/.*\/login/);
  } else {
    // Ultimate fallback: programmatic clear session
    await page.context().clearCookies();
    await page.evaluate(() => window.localStorage.clear());
    await page.evaluate(() => window.sessionStorage.clear());
    await page.goto('/login');
  }
}

export async function signup(page: Page, email: string, password: string = 'password123') {
  await page.goto('/signup');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('Confirm Password').fill(password);
  await page.getByRole('button', { name: 'Create Account' }).click();
  
  // After signup it redirects to login or shows success message
  await expect(page).toHaveURL(/.*\/login/);
}

/**
 * Generates a unique, realistic name with a randomized numeric suffix
 * to avoid duplicate names and enable parallel execution safety.
 */
export function generateUniqueName(baseName: string): string {
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${baseName} ${suffix}`;
}
