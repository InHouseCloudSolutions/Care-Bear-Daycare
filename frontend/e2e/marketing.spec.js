const { test, expect } = require('@playwright/test');

const INTERIOR_PAGES = [
  { path: '/about', heading: 'About' },
  { path: '/care-and-safety', heading: 'Thoughtful care. Every step of their stay.' },
  { path: '/reviews', heading: 'Happy dogs. Reassured owners.' },
  { path: '/gallery', heading: 'Gallery' },
  { path: '/contact', heading: "Let's talk about your dog." },
];

test.describe('marketing pages', () => {
  test('home introduces Care Bear Daycare and its public actions', async ({ page }) => {
    await test.step('Open the home page', async () => {
      await page.goto('/');
    });

    await test.step('Show the brand, tagline, and primary actions', async () => {
      await expect(page.getByRole('img', { name: 'Care Bear Daycare' })).toBeVisible();
      await expect(
        page.getByText(
          'Overnight care and daycare in Toronto and the GTA, with a safe backyard made for play.',
        ),
      ).toBeVisible();
      await expect(page.getByRole('link', { name: 'Book a stay' }).first()).toBeVisible();
      await expect(page.getByRole('link', { name: 'Plan a visit' }).first()).toBeVisible();
      await expect(page.getByRole('link', { name: 'See us on Rover' }).first()).toBeVisible();
    });
  });

  INTERIOR_PAGES.forEach(({ path, heading }) => {
    test(`${path} renders its page heading`, async ({ page }) => {
      await test.step(`Open ${path}`, async () => {
        await page.goto(path);
      });
      await test.step(`Show the ${heading} heading`, async () => {
        await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
      });
    });
  });

  test('how a stay works loads the scroll story instead of a missing page', async ({ page }) => {
    await test.step('Open /how-a-stay-works', async () => {
      await page.goto('/how-a-stay-works');
    });
    await test.step('Keep the marketing navigation and avoid the 404 screen', async () => {
      await expect(page).toHaveURL(/\/how-a-stay-works\/?$/);
      await expect(page.getByRole('link', { name: 'About' }).first()).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Page Not Found' })).toHaveCount(0);
    });
  });

  test('contact offers the daycare email', async ({ page }) => {
    await test.step('Open /contact', async () => {
      await page.goto('/contact');
    });
    await test.step('Show the contact mailbox', async () => {
      await expect(
        page.getByRole('link', { name: 'contact@carebeardaycare.ca' }).first(),
      ).toHaveAttribute('href', /mailto:contact@carebeardaycare\.ca/);
    });
  });

  test('book a stay from the home page asks a visitor to log in', async ({ page }) => {
    await test.step('Open the home page', async () => {
      await page.goto('/');
    });
    await test.step('Follow Book a stay', async () => {
      await page.getByRole('link', { name: 'Book a stay' }).first().click();
    });
    await test.step('Land on login with the booking path saved for after sign-in', async () => {
      await expect(page).toHaveURL(/\/login\?/);
      await expect(page).toHaveURL(/next=/);
      await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
    });
  });
});
