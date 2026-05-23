import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFileA = path.join(__dirname, '.auth/userA.json');
const authFileB = path.join(__dirname, '.auth/userB.json');

setup('authenticate as User A', async ({ page }) => {
  const email = process.env.TEST_USER_A_EMAIL;
  const password = process.env.TEST_USER_A_PASSWORD;

  if (!email || !password) {
    throw new Error('TEST_USER_A_EMAIL and TEST_USER_A_PASSWORD environment variables are required. Please add them to your .env.local file.');
  }

  await page.goto('/login');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();

  try {
    // If user exists and password is correct, we land on dashboard
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 5000 });
  } catch (err) {
    console.log('Login failed for User A, attempting self-healing signup...');
    
    // Go to signup page
    await page.goto('/signup');
    await page.getByLabel('Email address').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByLabel('Confirm Password').fill(password);
    await page.getByRole('button', { name: 'Create Account' }).click();

    // After signup, wait to redirect to login
    await expect(page).toHaveURL(/.*\/login/, { timeout: 10000 });

    // Now log in with the newly created user
    await page.getByLabel('Email address').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
  }

  // Store state
  await page.context().storageState({ path: authFileA });
});

setup('authenticate as User B', async ({ page }) => {
  const email = process.env.TEST_USER_B_EMAIL;
  const password = process.env.TEST_USER_B_PASSWORD;

  if (!email || !password) {
    throw new Error('TEST_USER_B_EMAIL and TEST_USER_B_PASSWORD environment variables are required. Please add them to your .env.local file.');
  }

  await page.goto('/login');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();

  try {
    // If user exists and password is correct, we land on dashboard
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 5000 });
  } catch (err) {
    console.log('Login failed for User B, attempting self-healing signup...');
    
    // Go to signup page
    await page.goto('/signup');
    await page.getByLabel('Email address').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByLabel('Confirm Password').fill(password);
    await page.getByRole('button', { name: 'Create Account' }).click();

    // After signup, wait to redirect to login
    await expect(page).toHaveURL(/.*\/login/, { timeout: 10000 });

    // Now log in with the newly created user
    await page.getByLabel('Email address').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
  }

  // Store state
  await page.context().storageState({ path: authFileB });
});
