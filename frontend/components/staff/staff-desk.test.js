import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ACCOUNT_PATH } from '@/consts/routes';
import { createCareUpdate, listCareUpdates } from '@/lib/daycareApi';
import StayCarePanel from './StayCarePanel';
import {
  bookingActions,
  bookingExtraFormError,
  bookingExtraLineLabel,
  bookingExtraPayload,
  bookingStatusPatch,
  daySpan,
  dogsInCareOn,
  extraFormError,
  extraFormState,
  extraKindLabel,
  extraPayload,
  formatDateRange,
  formatWindow,
  holidayFormError,
  holidayKindLabel,
  holidayPayload,
  householdFormError,
  householdMatches,
  householdPayload,
  isSameDayStay,
  moneyLabel,
  serviceFormError,
  serviceFormState,
  servicePayload,
  slugify,
  sortBookings,
  staffBookingBody,
  staffDeskRedirectPath,
  stayEditFormError,
  stayEditFormState,
  stayEditPayload,
  stayEditServiceOptions,
  timestampFormError,
  timestampInputValue,
  timestampPayload,
  timestampPayloadValue,
  exclusiveStayLine,
  todayIso,
  vaccineState,
  withStayCheckout,
} from './staff-desk';

jest.mock('@/lib/daycareApi', () => {
  const actual = jest.requireActual('@/lib/daycareApi');
  return {
    ...actual,
    listCareUpdates: jest.fn(),
    createCareUpdate: jest.fn(),
    listVaccines: jest.fn(),
  };
});

function isoPlusDays(iso, days) {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + days);
  const pad = value => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function renderStayCare({ status = 'requested', updates = [], dogs, vaccinesByDogId, parent } = {}) {
  listCareUpdates.mockResolvedValue({ ok: true, data: updates });
  return render(
    <ThemeProvider theme={createTheme()}>
      <StayCarePanel
        bookingId={10}
        status={status}
        dogs={dogs}
        parent={parent}
        token="staff-token"
        vaccinesByDogId={vaccinesByDogId}
      />
    </ThemeProvider>,
  );
}

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
  it('rejects an end date before the start date and builds a closed body', () => {
    expect(
      holidayFormError({
        name: 'Christmas',
        startsOn: '2026-12-26',
        endsOn: '2026-12-24',
        kind: 'closed',
      }),
    ).toBe('End date must be on or after the start date.');
    expect(
      holidayFormError({
        name: 'Christmas',
        startsOn: '2026-12-24',
        endsOn: '2026-12-24',
        kind: 'closed',
      }),
    ).toBeNull();
    expect(
      holidayPayload({
        name: ' Christmas ',
        startsOn: '2026-12-24',
        endsOn: '2026-12-26',
        kind: 'closed',
      }),
    ).toEqual({
      name: 'Christmas',
      starts_on: '2026-12-24',
      ends_on: '2026-12-26',
      kind: 'closed',
      surcharge_percent: null,
    });
  });

  it('requires a 0–100 percent for surcharge holidays', () => {
    const base = {
      name: 'New Year',
      startsOn: '2027-01-01',
      endsOn: '2027-01-01',
      kind: 'surcharge',
    };
    expect(holidayFormError(base)).toBe('Surcharge percent is required.');
    expect(holidayFormError({ ...base, surchargePercent: '-1' })).toBe(
      'Surcharge must be between 0 and 100.',
    );
    expect(holidayFormError({ ...base, surchargePercent: '101' })).toBe(
      'Surcharge must be between 0 and 100.',
    );
    expect(holidayFormError({ ...base, surchargePercent: '15' })).toBeNull();
    expect(holidayPayload({ ...base, surchargePercent: '15' })).toEqual({
      name: 'New Year',
      starts_on: '2027-01-01',
      ends_on: '2027-01-01',
      kind: 'surcharge',
      surcharge_percent: 15,
    });
    expect(holidayKindLabel({ kind: 'closed' })).toBe('Closed');
    expect(holidayKindLabel({ kind: 'surcharge', surcharge_percent: 15 })).toBe('+15% surcharge');
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

describe('desk helpers', () => {
  it('formats date ranges compactly', () => {
    expect(formatDateRange('2026-11-20', '2026-11-22')).toBe('Nov 20 – 22, 2026');
    expect(formatDateRange('2026-10-29', '2026-11-19')).toBe('Oct 29 – Nov 19, 2026');
    expect(formatDateRange('2026-12-30', '2027-01-02')).toBe('Dec 30, 2026 – Jan 2, 2027');
    expect(formatDateRange('2026-11-04', '2026-11-04')).toBe('Nov 4, 2026');
    expect(daySpan('2026-11-20', '2026-11-22')).toBe(3);
  });

  it('offers the next steps for each status', () => {
    expect(bookingActions('requested').map(a => a.status)).toEqual(['confirmed', 'declined']);
    expect(bookingActions('confirmed').map(a => a.status)).toEqual(['checked_in', 'cancelled']);
    expect(bookingActions('checked_in')).toEqual([
      { status: 'completed', label: 'Check out', primary: true, done: 'Checked out' },
    ]);
    expect(bookingActions('cancelled')).toEqual([]);
  });

  it('sorts requests first and counts dogs in care', () => {
    const rows = [
      { id: 1, status: 'confirmed', starts_on: '2026-11-01', ends_on: '2026-11-10', dogs: [1, 2] },
      { id: 2, status: 'requested', starts_on: '2026-12-01', ends_on: '2026-12-02', dogs: [3] },
      { id: 3, status: 'checked_in', starts_on: '2026-10-01', ends_on: '2026-10-02', dogs: [2, 4] },
    ];
    expect(sortBookings(rows).map(row => row.id)).toEqual([2, 3, 1]);
    expect(dogsInCareOn(rows, '2026-11-04')).toBe(3);
  });

  it('validates and builds household bodies', () => {
    expect(householdFormError({ email: '' }, { isNew: true })).toBe('Email is required.');
    expect(householdFormError({ email: 'nope' }, { isNew: true })).toBe(
      'Enter a valid email address.',
    );
    expect(householdFormError({ email: 'a@b.co' }, { isNew: true })).toBe(
      'Add at least a first or last name.',
    );
    expect(householdFormError({ last_name: 'Hopper' })).toBeNull();
    const body = householdPayload(
      { email: ' A@B.co ', password: '', first_name: ' Grace ' },
      { isNew: true },
    );
    expect(body).toMatchObject({ email: 'a@b.co', first_name: 'Grace', city: '' });
    expect(body).not.toHaveProperty('password');
    expect(householdPayload({ email: 'x@y.z', first_name: 'G' })).not.toHaveProperty('email');
  });

  it('searches households by dog name too', () => {
    const parent = { id: 1, first_name: 'Ada', email: 'ada@example.com' };
    expect(householdMatches(parent, 'bear', [{ pet_parent_id: 1, name: 'Bear' }])).toBe(true);
    expect(householdMatches(parent, 'zed', [])).toBe(false);
  });

  it('validates services and makes slugs', () => {
    expect(slugify('Drop-in Visit (30 min)')).toBe('drop-in-visit-30-min');
    expect(slugify('Café Walk')).toBe('cafe-walk');
    expect(serviceFormError({ name: 'Walk', rate: '-1' })).toBe('Rate must be zero or more.');
    expect(serviceFormError({ name: 'Walk', rate: '20', max_dogs_per_day: '0' })).toMatch(
      /whole number/,
    );
    expect(
      servicePayload({
        name: ' Long walk ',
        slug: '',
        kind: 'walk',
        rate: '25',
        rate_unit: 'visit',
        max_dogs_per_day: '',
        active: true,
      }),
    ).toEqual({
      name: 'Long walk',
      slug: 'long-walk',
      kind: 'walk',
      rate: '25.00',
      rate_unit: 'visit',
      max_dogs_per_day: null,
      active: true,
      check_in_from: null,
      check_in_until: null,
      check_out_from: null,
      check_out_until: null,
    });
  });

  it('sends blank check-in/out windows as null and keeps set ones as HH:MM:SS', () => {
    const base = {
      name: 'Walk',
      slug: '',
      kind: 'walk',
      rate: '20',
      rate_unit: 'visit',
      max_dogs_per_day: '',
      active: true,
    };
    expect(
      servicePayload({
        ...base,
        check_in_from: '07:00',
        check_in_until: '',
        check_out_from: '',
        check_out_until: '18:00',
      }),
    ).toMatchObject({
      check_in_from: '07:00:00',
      check_in_until: null,
      check_out_from: null,
      check_out_until: '18:00:00',
    });
    expect(servicePayload(base)).toMatchObject({
      check_in_from: null,
      check_in_until: null,
      check_out_from: null,
      check_out_until: null,
    });
  });

  it('reads existing check-in/out windows back into the form', () => {
    expect(
      serviceFormState({
        name: 'Daycare',
        slug: 'daycare',
        kind: 'daycare',
        rate: '35.00',
        rate_unit: 'day',
        max_dogs_per_day: 10,
        active: true,
        check_in_from: '07:00:00',
        check_in_until: null,
        check_out_from: '15:00:00',
        check_out_until: '18:00:00',
      }),
    ).toMatchObject({
      check_in_from: '07:00',
      check_in_until: '',
      check_out_from: '15:00',
      check_out_until: '18:00',
    });
  });

  it('flags expired and soon-to-expire vaccines', () => {
    expect(vaccineState('2026-01-01', '2026-11-04')).toBe('expired');
    expect(vaccineState('2026-11-20', '2026-11-04')).toBe('soon');
    expect(vaccineState('2027-06-01', '2026-11-04')).toBe('ok');
    expect(vaccineState(null, '2026-11-04')).toBe('none');
  });

  it('formats a time-of-day window', () => {
    expect(formatWindow('07:00:00', '10:00:00')).toBe('7:00 AM – 10:00 AM');
    expect(formatWindow(null, '18:00:00')).toBe('6:00 PM');
    expect(formatWindow(null, null)).toBeNull();
  });

  it('formats money', () => {
    expect(moneyLabel('35.00')).toBe('$35.00');
    expect(moneyLabel(0)).toBe('$0.00');
    expect(moneyLabel(null)).toBe('—');
  });
});

describe('extras catalog', () => {
  it('validates and builds a catalog extra for item and late-checkout kinds', () => {
    expect(extraFormError({ name: '', unit_price: '5', kind: 'item' })).toBe('Name is required.');
    expect(extraFormError({ name: 'Bath', unit_price: '-1', kind: 'item' })).toBe(
      'Unit price must be zero or more.',
    );
    expect(extraFormError({ name: 'Bath', unit_price: '25', kind: 'item' })).toBeNull();
    expect(extraFormError({ name: 'Bath', unit_price: '25', kind: 'bogus' })).toBe(
      'Choose a kind.',
    );
    expect(extraPayload({ name: ' Bath ', unit_price: '25', kind: 'item', active: true })).toEqual({
      name: 'Bath',
      unit_price: '25.00',
      kind: 'item',
      active: true,
    });
    expect(extraKindLabel('late_checkout')).toBe('Late checkout fee');
    expect(extraKindLabel('item')).toBe('Item');
    expect(
      extraFormState({
        name: 'Late fee',
        unit_price: '10.00',
        kind: 'late_checkout',
        active: false,
      }),
    ).toEqual({ name: 'Late fee', unit_price: '10.00', kind: 'late_checkout', active: false });
    expect(extraFormState()).toMatchObject({
      name: '',
      unit_price: '',
      kind: 'item',
      active: true,
    });
  });
});

describe('booking extra lines', () => {
  it('validates and builds a line body', () => {
    expect(bookingExtraFormError({ extraId: '', quantity: '1' })).toBe('Choose an item.');
    expect(bookingExtraFormError({ extraId: '1', quantity: '0' })).toMatch(/whole number/);
    expect(bookingExtraFormError({ extraId: '1', quantity: '2' })).toBeNull();
    expect(bookingExtraPayload({ extraId: '3', quantity: '2' })).toEqual({
      extra_id: 3,
      quantity: 2,
    });
  });

  it('formats a line for display, hiding the multiplier for a single unit', () => {
    expect(bookingExtraLineLabel({ description: 'Poop bags', quantity: 2, amount: '10.00' })).toBe(
      'Poop bags × 2 — $10.00',
    );
    expect(bookingExtraLineLabel({ description: 'Bath', quantity: 1, amount: '25.00' })).toBe(
      'Bath — $25.00',
    );
  });
});

describe('edit stay form', () => {
  const booking = {
    id: 13,
    pet_parent_id: 9,
    service_id: 2,
    dogs: [3, 4],
    status: 'cancelled',
    starts_on: '2026-11-02',
    ends_on: '2026-11-04',
    est_checkin_start: '07:30:00',
    est_checkin_end: null,
    est_checkout_start: '16:00:00',
    est_checkout_end: '18:00',
    parent_note: 'Gate code',
    charge: '105.00',
    checked_in_at: '2026-11-02T12:00:00Z',
    checked_out_at: null,
  };

  const seeded = () => stayEditFormState(booking);

  it('seeds the form from the booking without status or household', () => {
    expect(seeded()).toEqual({
      serviceId: '2',
      dogIds: [3, 4],
      startsOn: '2026-11-02',
      endsOn: '2026-11-04',
      estCheckinStart: '07:30',
      estCheckinEnd: '',
      estCheckoutStart: '16:00',
      estCheckoutEnd: '18:00',
      parentNote: 'Gate code',
      charge: '105.00',
    });
    expect(seeded()).not.toHaveProperty('status');
    expect(seeded()).not.toHaveProperty('petParentId');
    expect(stayEditFormState({})).toMatchObject({
      serviceId: '',
      dogIds: [],
      charge: '',
      parentNote: '',
    });
  });

  it('keeps an inactive current service in the list and drops other inactive ones', () => {
    const services = [
      { id: 1, name: 'Daycare', active: true },
      { id: 2, name: 'Old walk', active: false },
      { id: 3, name: 'Retired', active: false },
    ];
    expect(stayEditServiceOptions(services, 2).map(service => service.id)).toEqual([1, 2]);
  });

  it('locks checkout to check-in for walk and drop-in', () => {
    const form = { startsOn: '2026-11-02', endsOn: '2026-11-04' };
    expect(withStayCheckout(form, 'walk')).toEqual({
      startsOn: '2026-11-02',
      endsOn: '2026-11-02',
    });
    expect(withStayCheckout(form, 'drop_in').endsOn).toBe('2026-11-02');
    expect(withStayCheckout(form, 'daycare')).toBe(form);
    expect(withStayCheckout(form, 'boarding')).toBe(form);
    expect(isSameDayStay('walk')).toBe(true);
    expect(isSameDayStay('daycare')).toBe(false);
  });

  it('validates dates by service kind, windows, and at least one dog', () => {
    const form = seeded();
    expect(stayEditFormError({ ...form, dogIds: [] }, 'daycare')).toBe('Choose at least one dog.');
    expect(stayEditFormError({ ...form, serviceId: '' }, 'daycare')).toBe('Choose a service.');
    expect(stayEditFormError({ ...form, endsOn: '2026-11-01' }, 'daycare')).toBe(
      'Checkout must be on or after check-in.',
    );
    expect(stayEditFormError({ ...form, endsOn: '2026-11-02' }, 'daycare')).toBeNull();
    expect(stayEditFormError({ ...form, endsOn: form.startsOn }, 'boarding')).toBe(
      'Boarding checkout must be after check-in.',
    );
    expect(stayEditFormError(form, 'boarding')).toBeNull();
    expect(stayEditFormError(form, 'walk')).toBe('Checkout must be the same day as check-in.');
    expect(stayEditFormError({ ...form, endsOn: form.startsOn }, 'drop_in')).toBeNull();
    expect(
      stayEditFormError({ ...form, estCheckinStart: '10:00', estCheckinEnd: '09:00' }, 'daycare'),
    ).toBe('Expected check-in end must be at or after the start.');
    expect(
      stayEditFormError({ ...form, estCheckoutStart: '15:00', estCheckoutEnd: '14:00' }, 'daycare'),
    ).toBe('Expected checkout end must be at or after the start.');
    expect(
      stayEditFormError({ ...form, estCheckinStart: '10:00', estCheckinEnd: '' }, 'daycare'),
    ).toBeNull();
    expect(
      stayEditFormError({ ...form, estCheckinStart: '09:00', estCheckinEnd: '09:00' }, 'daycare'),
    ).toBeNull();
    expect(stayEditFormError({ ...form, charge: '-1' }, 'daycare')).toMatch(/zero or more/);
    expect(stayEditFormError({ ...form, startsOn: '', endsOn: '' }, 'daycare')).toBe(
      'Check-in and checkout dates are required.',
    );
  });

  it('omits a blank or zero charge, sends 35.00, and nulls blank windows', () => {
    const form = {
      ...seeded(),
      estCheckinEnd: '',
      estCheckoutStart: '',
      charge: '',
    };
    const blankCharge = stayEditPayload(form);
    expect(blankCharge).toEqual({
      service_id: 2,
      dogs: [3, 4],
      starts_on: '2026-11-02',
      ends_on: '2026-11-04',
      est_checkin_start: '07:30:00',
      est_checkin_end: null,
      est_checkout_start: null,
      est_checkout_end: '18:00:00',
      parent_note: 'Gate code',
    });
    expect(blankCharge).not.toHaveProperty('charge');
    expect(blankCharge).not.toHaveProperty('status');
    expect(blankCharge).not.toHaveProperty('pet_parent_id');
    expect(blankCharge).not.toHaveProperty('checked_in_at');
    expect(blankCharge).not.toHaveProperty('checked_out_at');
    expect(blankCharge).not.toHaveProperty('total');
    expect(stayEditPayload({ ...form, charge: '0' })).not.toHaveProperty('charge');
    expect(stayEditPayload({ ...form, charge: '0.00' })).not.toHaveProperty('charge');
    expect(stayEditPayload({ ...form, charge: '35.00' }).charge).toBe('35.00');
  });
});

describe('check-in and checkout timestamps', () => {
  it('round-trips a timestamp through the datetime-local input', () => {
    const iso = '2026-11-02T12:05:00.000Z';
    const value = timestampInputValue(iso);
    expect(value).toMatch(/^2026-11-02T\d{2}:05$/);
    expect(timestampPayloadValue(value)).toBe(new Date(value).toISOString());
    expect(timestampPayloadValue('')).toBeNull();
    expect(timestampInputValue(null)).toBe('');
  });

  it('rejects a checkout time before check-in', () => {
    expect(
      timestampFormError({ checkedInAt: '2026-11-02T12:00', checkedOutAt: '2026-11-02T11:00' }),
    ).toBe('Checkout time must be on or after check-in.');
    expect(
      timestampFormError({ checkedInAt: '2026-11-02T12:00', checkedOutAt: '2026-11-02T13:00' }),
    ).toBeNull();
    expect(timestampFormError({ checkedInAt: '', checkedOutAt: '' })).toBeNull();
  });

  it('builds a PATCH body, sending blanks as null', () => {
    expect(timestampPayload({ checkedInAt: '', checkedOutAt: '2026-11-02T13:00' })).toEqual({
      checked_in_at: null,
      checked_out_at: new Date('2026-11-02T13:00').toISOString(),
    });
  });
});

describe('stay care brief', () => {
  const soon = isoPlusDays(todayIso(), 10);
  const bear = {
    id: 3,
    name: 'Bear',
    good_with_dogs: false,
    medications: '',
    feeding: '   ',
    vet_name: 'Main St Vet',
    vet_phone: '',
  };
  const pip = {
    id: 4,
    name: 'Pip',
    good_with_dogs: true,
    medications: 'Apoquel',
    feeding: 'One cup',
    vet_name: 'Main St Vet',
    vet_phone: '555-0199',
  };
  const parent = { emergency_name: '', emergency_phone: '555-0100' };
  const vaccinesByDogId = {
    3: [{ id: 1, kind: 'rabies', label: '', expires_on: soon }],
    4: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    listCareUpdates.mockResolvedValue({ ok: true, data: [] });
    createCareUpdate.mockResolvedValue({ ok: true, data: { id: 1 } });
  });

  it('names the not-social dog and does not label a social dog', () => {
    renderStayCare({ dogs: [bear, pip], parent, vaccinesByDogId });
    expect(screen.getByText('Exclusive stay — Bear is not social.')).toBeInTheDocument();
    expect(screen.queryByText(/Pip is not social/)).not.toBeInTheDocument();
    expect(
      exclusiveStayLine([
        { name: 'Bear', good_with_dogs: false },
        { name: 'Shadow' },
      ]),
    ).toBe('Exclusive stay — Bear and Shadow are not social.');
  });

  it('says nothing recorded for blank medications', () => {
    renderStayCare({ dogs: [bear], parent, vaccinesByDogId });
    expect(screen.getByText('Medications: nothing recorded')).toBeInTheDocument();
    expect(screen.getByText('Feeding: nothing recorded')).toBeInTheDocument();
    expect(screen.getByText('Vet: Main St Vet · nothing recorded')).toBeInTheDocument();
    expect(screen.getByText('Emergency contact: nothing recorded · 555-0100')).toBeInTheDocument();
  });

  it('says no vaccines recorded when a dog has no vaccine rows', () => {
    renderStayCare({ dogs: [pip], parent, vaccinesByDogId });
    expect(screen.getByText('Pip: no vaccines recorded')).toBeInTheDocument();
  });

  it('names a vaccine that expires soon', () => {
    renderStayCare({ dogs: [bear], parent, vaccinesByDogId });
    expect(screen.getByText('Bear — Rabies expires soon')).toBeInTheDocument();
  });

  it('does not call a missing Bordetella row required', () => {
    renderStayCare({ dogs: [bear, pip], parent, vaccinesByDogId });
    expect(screen.queryByText(/bordetella/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/required/i)).not.toBeInTheDocument();
  });

  it('hides the composer when the stay is requested', () => {
    renderStayCare({ status: 'requested', dogs: [bear], parent, vaccinesByDogId });
    expect(screen.queryByRole('button', { name: 'Save update' })).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Potty' })).not.toBeInTheDocument();
  });

  it('does not create an update when every answer is no and the note is blank', () => {
    renderStayCare({ status: 'confirmed', dogs: [bear], parent, vaccinesByDogId });
    const save = screen.getByRole('button', { name: 'Save update' });
    expect(save).toBeDisabled();
    fireEvent.click(save);
    expect(createCareUpdate).not.toHaveBeenCalled();
  });

  it('creates a note-only update and reloads the list', async () => {
    renderStayCare({ status: 'checked_in', dogs: [bear], parent, vaccinesByDogId });
    fireEvent.change(screen.getByLabelText('Note'), { target: { value: 'Ate dinner' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save update' }));
    await waitFor(() =>
      expect(createCareUpdate).toHaveBeenCalledWith('staff-token', 10, {
        potty: false,
        food: false,
        play: false,
        meds_given: false,
        body: 'Ate dinner',
      }),
    );
    await waitFor(() => expect(listCareUpdates).toHaveBeenCalledTimes(2));
  });

  it('lists care updates newest first and skips a blank author name', async () => {
    renderStayCare({
      status: 'completed',
      dogs: [bear],
      parent,
      vaccinesByDogId,
      updates: [
        {
          id: 1,
          author: 99,
          author_name: 'Chris C.',
          potty: false,
          food: false,
          play: false,
          meds_given: true,
          body: 'Older note',
          created_at: '2026-11-01T12:00:00Z',
        },
        {
          id: 2,
          author: 99,
          author_name: '',
          potty: true,
          food: true,
          play: false,
          meds_given: false,
          body: 'Newer note',
          created_at: '2026-11-02T18:00:00Z',
        },
      ],
    });
    const items = await screen.findAllByRole('listitem');
    expect(items[0]).toHaveTextContent('Newer note');
    expect(items[0]).toHaveTextContent('Potty yes');
    expect(items[0]).not.toHaveTextContent('Chris C.');
    expect(items[0]).not.toHaveTextContent('99');
    expect(items[1]).toHaveTextContent('Older note');
    expect(items[1]).toHaveTextContent('Chris C.');
    expect(items[1]).toHaveTextContent('Meds yes');
  });
});
