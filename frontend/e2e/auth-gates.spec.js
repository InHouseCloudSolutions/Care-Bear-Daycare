const { test, expect } = require('@playwright/test');

test.describe('signed-out gates', () => {
  test('the account page sends a visitor to login', async ({ page }) => {
    await test.step('Open /account', async () => {
      await page.goto('/account');
    });
    await test.step('Redirect to login and keep the account path', async () => {
      await expect(page).toHaveURL(/\/login\?next=/);
      await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
    });
  });

  test('the booking page sends a visitor to login', async ({ page }) => {
    await test.step('Open /account/book', async () => {
      await page.goto('/account/book');
    });
    await test.step('Redirect to login', async () => {
      await expect(page).toHaveURL(/\/login\?next=/);
      await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
    });
  });

  test('staff has a login entry and no public screen', async ({ page }) => {
    await test.step('Open the home page signed out', async () => {
      await page.goto('/');
    });
    await test.step('Point the Login link at /staff for after sign-in', async () => {
      await expect(page.getByRole('link', { name: 'Login' }).first()).toHaveAttribute(
        'href',
        /\/login\?next=%2Fstaff/,
      );
    });
    await test.step('Open /staff', async () => {
      await page.goto('/staff');
    });
    await test.step('Redirect to login because there is no public staff page', async () => {
      await expect(page).toHaveURL(/\/login\?next=/);
      await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
    });
  });
});
