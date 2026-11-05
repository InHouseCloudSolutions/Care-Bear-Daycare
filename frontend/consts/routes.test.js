import { ACCOUNT_PATH, STAFF_PREFIX, postLoginPath, safeAccountNextPath } from './routes';

describe('postLoginPath', () => {
  const staff = { isStaff: true };
  const petParent = { isStaff: false };

  it('sends staff with no next to /staff', () => {
    expect(postLoginPath(staff, null)).toBe(STAFF_PREFIX);
    expect(postLoginPath(staff, undefined)).toBe(STAFF_PREFIX);
  });

  it('allows staff next under /staff', () => {
    expect(postLoginPath(staff, '/staff/calendar')).toBe('/staff/calendar');
  });

  it('sends staff with an account next to /staff', () => {
    expect(postLoginPath(staff, '/account/book')).toBe(STAFF_PREFIX);
  });

  it('allows pet parent next under /account', () => {
    expect(postLoginPath(petParent, '/account/book')).toBe('/account/book');
  });

  it('sends pet parent with a staff next to /account', () => {
    expect(postLoginPath(petParent, '/staff')).toBe(ACCOUNT_PATH);
  });

  it('rejects /staff-evil and /account-evil via path boundary', () => {
    expect(postLoginPath(staff, '/staff-evil')).toBe(STAFF_PREFIX);
    expect(postLoginPath(petParent, '/account-evil')).toBe(ACCOUNT_PATH);
  });
});

describe('safeAccountNextPath', () => {
  it('keeps nested account paths and rejects lookalikes', () => {
    expect(safeAccountNextPath('/account/book')).toBe('/account/book');
    expect(safeAccountNextPath('/account')).toBe(ACCOUNT_PATH);
    expect(safeAccountNextPath('/account-evil')).toBe(ACCOUNT_PATH);
    expect(safeAccountNextPath('/staff')).toBe(ACCOUNT_PATH);
  });
});
