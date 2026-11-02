import { ACCOUNT_PATH } from '@/consts/routes';
import {
  bookingStatusPatch,
  holidayFormError,
  holidayPayload,
  staffBookingBody,
  staffDeskRedirectPath,
} from './staff-desk';

describe('staffDeskRedirectPath', () => {
  it('sends a signed-in pet parent to their account', () => {
    expect(staffDeskRedirectPath({ isStaff: false, username: 'ada@example.com' })).toBe(
      ACCOUNT_PATH,
    );
    expect(staffDeskRedirectPath({ username: 'ada@example.com' })).toBe(ACCOUNT_PATH);
  });

  it('keeps staff on the desk and leaves a missing user to the auth gate', () => {
    expect(staffDeskRedirectPath({ isStaff: true })).toBeNull();
    expect(staffDeskRedirectPath(null)).toBeNull();
    expect(staffDeskRedirectPath(undefined)).toBeNull();
  });
});

describe('holiday form', () => {
  it('rejects an end date before the start date and builds the closure body', () => {
    expect(
      holidayFormError({ name: 'Christmas', startsOn: '2026-12-26', endsOn: '2026-12-24' }),
    ).toBe('End date must be on or after the start date.');
    expect(
      holidayFormError({ name: 'Christmas', startsOn: '2026-12-24', endsOn: '2026-12-24' }),
    ).toBeNull();
    expect(
      holidayPayload({ name: ' Christmas ', startsOn: '2026-12-24', endsOn: '2026-12-26' }),
    ).toEqual({
      name: 'Christmas',
      starts_on: '2026-12-24',
      ends_on: '2026-12-26',
    });
  });
});

describe('bookingStatusPatch', () => {
  it('confirms a stay with a status patch', () => {
    expect(bookingStatusPatch('confirmed')).toEqual({ status: 'confirmed' });
    expect(
      staffBookingBody({
        petParentId: '4',
        serviceId: '1',
        dogIds: ['3', 8],
        startsOn: '2026-11-02',
        endsOn: '2026-11-04',
      }),
    ).toEqual({
      pet_parent_id: 4,
      service_id: 1,
      dogs: [3, 8],
      starts_on: '2026-11-02',
      ends_on: '2026-11-04',
      status: 'confirmed',
    });
  });
});
