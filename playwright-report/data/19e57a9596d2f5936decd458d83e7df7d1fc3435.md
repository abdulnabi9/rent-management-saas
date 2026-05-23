# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: global.setup.ts >> authenticate as User A
- Location: e2e/global.setup.ts:7:6

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /.*\/login/
Received string:  "http://localhost:3001/signup"
Timeout: 10000ms

Call log:
  - Expect "toHaveURL" with timeout 10000ms
    24 × unexpected value "http://localhost:3001/signup"

```

```yaml
- img
- heading "RentFlow" [level=1]
- paragraph: Rental Building Management
- heading "Create your account" [level=2]
- text: Email address
- textbox "Email address":
  - /placeholder: you@example.com
  - text: testusera@example.com
- text: Password
- textbox "Password":
  - /placeholder: Min 8 characters
  - text: password123
- text: Confirm Password
- textbox "Confirm Password":
  - /placeholder: Repeat password
  - text: password123
- button "Create Account"
- paragraph:
  - text: Already have an account?
  - link "Sign in":
    - /url: /login
- region "Notifications alt+T"
- alert
```

# Test source

```ts
  1  | import { test as setup, expect } from '@playwright/test';
  2  | import path from 'path';
  3  | 
  4  | const authFileA = path.join(__dirname, '.auth/userA.json');
  5  | const authFileB = path.join(__dirname, '.auth/userB.json');
  6  | 
  7  | setup('authenticate as User A', async ({ page }) => {
  8  |   const email = process.env.TEST_USER_A_EMAIL;
  9  |   const password = process.env.TEST_USER_A_PASSWORD;
  10 | 
  11 |   if (!email || !password) {
  12 |     throw new Error('TEST_USER_A_EMAIL and TEST_USER_A_PASSWORD environment variables are required. Please add them to your .env.local file.');
  13 |   }
  14 | 
  15 |   await page.goto('/login');
  16 |   await page.getByLabel('Email address').fill(email);
  17 |   await page.getByLabel('Password', { exact: true }).fill(password);
  18 |   await page.getByRole('button', { name: 'Sign In' }).click();
  19 | 
  20 |   try {
  21 |     // If user exists and password is correct, we land on dashboard
  22 |     await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 5000 });
  23 |   } catch (err) {
  24 |     console.log('Login failed for User A, attempting self-healing signup...');
  25 |     
  26 |     // Go to signup page
  27 |     await page.goto('/signup');
  28 |     await page.getByLabel('Email address').fill(email);
  29 |     await page.getByLabel('Password', { exact: true }).fill(password);
  30 |     await page.getByLabel('Confirm Password').fill(password);
  31 |     await page.getByRole('button', { name: 'Create Account' }).click();
  32 | 
  33 |     // After signup, wait to redirect to login
> 34 |     await expect(page).toHaveURL(/.*\/login/, { timeout: 10000 });
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  35 | 
  36 |     // Now log in with the newly created user
  37 |     await page.getByLabel('Email address').fill(email);
  38 |     await page.getByLabel('Password', { exact: true }).fill(password);
  39 |     await page.getByRole('button', { name: 'Sign In' }).click();
  40 |     await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
  41 |   }
  42 | 
  43 |   // Store state
  44 |   await page.context().storageState({ path: authFileA });
  45 | });
  46 | 
  47 | setup('authenticate as User B', async ({ page }) => {
  48 |   const email = process.env.TEST_USER_B_EMAIL;
  49 |   const password = process.env.TEST_USER_B_PASSWORD;
  50 | 
  51 |   if (!email || !password) {
  52 |     throw new Error('TEST_USER_B_EMAIL and TEST_USER_B_PASSWORD environment variables are required. Please add them to your .env.local file.');
  53 |   }
  54 | 
  55 |   await page.goto('/login');
  56 |   await page.getByLabel('Email address').fill(email);
  57 |   await page.getByLabel('Password', { exact: true }).fill(password);
  58 |   await page.getByRole('button', { name: 'Sign In' }).click();
  59 | 
  60 |   try {
  61 |     // If user exists and password is correct, we land on dashboard
  62 |     await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 5000 });
  63 |   } catch (err) {
  64 |     console.log('Login failed for User B, attempting self-healing signup...');
  65 |     
  66 |     // Go to signup page
  67 |     await page.goto('/signup');
  68 |     await page.getByLabel('Email address').fill(email);
  69 |     await page.getByLabel('Password', { exact: true }).fill(password);
  70 |     await page.getByLabel('Confirm Password').fill(password);
  71 |     await page.getByRole('button', { name: 'Create Account' }).click();
  72 | 
  73 |     // After signup, wait to redirect to login
  74 |     await expect(page).toHaveURL(/.*\/login/, { timeout: 10000 });
  75 | 
  76 |     // Now log in with the newly created user
  77 |     await page.getByLabel('Email address').fill(email);
  78 |     await page.getByLabel('Password', { exact: true }).fill(password);
  79 |     await page.getByRole('button', { name: 'Sign In' }).click();
  80 |     await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
  81 |   }
  82 | 
  83 |   // Store state
  84 |   await page.context().storageState({ path: authFileB });
  85 | });
  86 | 
```