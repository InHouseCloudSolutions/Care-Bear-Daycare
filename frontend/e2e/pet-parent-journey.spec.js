const { test, expect } = require('@playwright/test');
const { selectStayDates } = require('./stay-dates');

const PASSWORD = 'Correct-Horse-Battery-99';

function allowsAccountMutation() {
  return process.env.E2E_CONFIRM_LOCAL_API === '1';
}

test.describe('pet parent journey', () => {
  test('register, profile, dog, vaccine, stay request, then sign in again', async ({ page }) => {
    test.skip(
      !allowsAccountMutation(),
      'Set E2E_CONFIRM_LOCAL_API=1 only when DAYCARE_API_ORIGIN is a local API. The Dog Hotel Docker stack otherwise proxies accounts to production.',
    );
    test.setTimeout(180000);

    const stamp = Date.now();
    const email = `e2e-${stamp}@example.com`;
    const dogName = `Pip${stamp}`;

    await test.step('Open registration', async () => {
      await page.goto('/register');
      await expect(page.getByRole('heading', { name: 'Create an account' })).toBeVisible();
    });

    await test.step('Create a pet parent account', async () => {
      await page.getByRole('textbox', { name: 'Email' }).fill(email);
      await page.getByRole('textbox', { name: 'Password' }).fill(PASSWORD);
      await page.getByRole('textbox', { name: 'First name' }).fill('Ada');
      await page.getByRole('textbox', { name: 'Last name' }).fill('Lovelace');
      await page.getByRole('textbox', { name: 'Phone' }).fill('4165550100');
      await page.getByRole('button', { name: 'Create account' }).click();
    });

    await test.step('Land on the account page', async () => {
      await expect(page).toHaveURL(/\/account\/?$/);
      await expect(page.getByRole('heading', { name: 'Your account' })).toBeVisible();
      await expect(page.getByText('Welcome back, Ada.')).toBeVisible();
    });

    await test.step('Save the profile', async () => {
      await page.getByRole('textbox', { name: 'Address' }).fill('12 Play Yard');
      await page.getByRole('textbox', { name: 'City' }).fill('Toronto');
      await page.getByRole('textbox', { name: 'Emergency contact name' }).fill('Charles Babbage');
      await page.getByRole('textbox', { name: 'Emergency contact phone' }).fill('4165550199');
      await page.getByRole('button', { name: 'Save changes' }).click();
      await expect(page.getByText('Saved.', { exact: true })).toBeVisible();
    });

    await test.step('Add a dog', async () => {
      await page.getByRole('button', { name: 'Add a dog' }).click();
      await page.getByRole('textbox', { name: 'Name', exact: true }).fill(dogName);
      await page.getByRole('combobox', { name: 'Sex' }).click();
      await page.getByRole('option', { name: 'female' }).click();
      await page.getByRole('textbox', { name: 'Breed' }).fill('Mixed');
      await page.getByRole('spinbutton', { name: 'Weight (lb)' }).fill('22');
      await page.getByRole('textbox', { name: 'Birth date' }).fill('2022-04-01');
      await page.getByRole('checkbox', { name: 'Spayed / neutered' }).check();
      await page.getByRole('checkbox', { name: 'Good with other dogs' }).check();
      await page.getByRole('textbox', { name: 'Feeding' }).fill('Breakfast and dinner');
      await page.getByRole('button', { name: 'Add dog' }).click();
      await expect(page.getByText(dogName, { exact: true })).toBeVisible();
    });

    await test.step('Record a rabies vaccine', async () => {
      await page.getByRole('button', { name: 'Add vaccine' }).click();
      await page.getByRole('textbox', { name: 'Expires on' }).fill('2027-04-01');
      await page.getByRole('button', { name: 'Add', exact: true }).click();
      await expect(page.getByText('rabies · expires 2027-04-01')).toBeVisible();
    });

    await test.step('Open booking', async () => {
      await page.getByRole('link', { name: 'Book a stay' }).click();
      await expect(page.getByRole('heading', { name: 'Book a stay' })).toBeVisible();
      await expect(page.getByText('Loading your dogs…')).toHaveCount(0);
    });

    await test.step('Choose the dog, a service, dates, and a note', async () => {
      await expect(page.getByRole('checkbox', { name: new RegExp(dogName) })).toBeChecked();
      await expect(page.getByText('No services are open for requests right now.')).toHaveCount(0);
      await page.getByRole('radiogroup', { name: 'Service' }).getByRole('radio').first().click();
      await selectStayDates(page);
      await page.getByRole('textbox', { name: 'Note for staff' }).fill('E2E stay request');
    });

    await test.step('Send the stay request', async () => {
      await page.getByRole('button', { name: 'Send stay request' }).click();
    });

    await test.step('Show that staff still have to confirm the stay', async () => {
      await expect(
        page.getByText('We received your request. It is not booked until staff confirms.'),
      ).toBeVisible();
    });

    await test.step('Open /staff while signed in as a pet parent', async () => {
      await page.goto('/staff');
    });

    await test.step('Send a pet parent back to their account', async () => {
      await expect(page).toHaveURL(/\/account\/?$/);
      await expect(page.getByRole('heading', { name: 'Your account' })).toBeVisible();
    });

    await test.step('Log out', async () => {
      await page.goto('/account');
      await page.getByRole('button', { name: 'Log out' }).click();
      await expect(page).toHaveURL(/\/login/);
    });

    await test.step('Log in with the email as the username', async () => {
      await page.getByRole('textbox', { name: 'Username' }).fill(email);
      await page.getByRole('textbox', { name: 'Password' }).fill(PASSWORD);
      await page.getByRole('button', { name: 'Log in' }).click();
      await expect(page).toHaveURL(/\/account\/?$/);
      await expect(page.getByText('Welcome back, Ada.')).toBeVisible();
      await expect(page.getByText(dogName, { exact: true })).toBeVisible();
    });
  });
});
