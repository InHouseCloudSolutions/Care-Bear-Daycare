const { expect } = require('@playwright/test');

/** Pick enough open calendar days for the stay request button to enable. */

function openDayLocator(page) {
  return page.locator(
    'button[aria-label$="open"]:not([disabled]), button[aria-label$="joinable"]:not([disabled])',
  );
}

async function waitForMonth(page) {
  const loading = page.getByText('Loading availability…');
  if (await loading.count()) {
    await loading.first().waitFor({ state: 'hidden' });
  }
}

async function firstOpenDay(page, monthsLeft) {
  await waitForMonth(page);
  const days = openDayLocator(page);
  if ((await days.count()) > 0) return days.first();
  if (monthsLeft <= 1) return null;
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  return firstOpenDay(page, monthsLeft - 1);
}

async function clickLaterDay(page, firstLabel) {
  const days = openDayLocator(page);
  const count = await days.count();
  const labels = await Promise.all(
    Array.from({ length: count }, (_, index) => days.nth(index).getAttribute('aria-label')),
  );
  const index = labels.findIndex(label => label && label !== firstLabel);
  if (index < 0) return false;
  await days.nth(index).click();
  return true;
}

async function requestReady(page) {
  const request = page.getByRole('button', { name: 'Request this stay' });
  try {
    await expect(request).toBeEnabled({ timeout: 2500 });
    return true;
  } catch (error) {
    return !error;
  }
}

async function completeRange(page, firstLabel, monthsLeft) {
  if (await requestReady(page)) return;
  await waitForMonth(page);
  const clicked = await clickLaterDay(page, firstLabel);
  if (clicked && (await requestReady(page))) return;
  if (monthsLeft <= 1) {
    throw new Error('Could not complete a stay date range.');
  }
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await completeRange(page, firstLabel, monthsLeft - 1);
}

async function selectStayDates(page) {
  const first = await firstOpenDay(page, 4);
  if (!first) {
    throw new Error('No open or joinable day in the next four months.');
  }
  const firstLabel = await first.getAttribute('aria-label');
  await first.click();
  await completeRange(page, firstLabel, 4);
}

module.exports = { selectStayDates };
