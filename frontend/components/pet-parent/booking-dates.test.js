import {
  BOOKED_RANGE_MESSAGE,
  BOARDING_SAME_DAY_MESSAGE,
  CLOSED_RANGE_MESSAGE,
  VISIT_RANGE_MESSAGE,
  availabilityFailureMessage,
  bookingDogs,
  dayStatePhrase,
  dogsForHousehold,
  showHouseholdPicker,
  eachIsoDate,
  isPastIsoDate,
  monthsBetween,
  petParentIds,
  rangeBlockMessage,
} from './booking-dates';

const open = { state: 'open', reason: null };
const joinable = { state: 'joinable', reason: null };
const booked = { state: 'unavailable', reason: 'booked' };
const closed = { state: 'closed', reason: 'closed' };

describe('household availability', () => {
  const dogs = [
    { id: 1, pet_parent_id: 1, name: 'Bear' },
    { id: 2, pet_parent_id: 4, name: 'Kiki' },
    { id: 3, pet_parent_id: 4, name: 'Noodle' },
  ];

  it('keeps one household so a staff list can ask for availability', () => {
    expect(petParentIds(dogs)).toEqual([1, 4]);
    expect(dogsForHousehold(dogs, 4).map(dog => dog.name)).toEqual(['Kiki', 'Noodle']);
    expect(dogsForHousehold(dogs, null)).toBe(dogs);
  });

  it('hides other households from a pet parent and shows the picker only to staff', () => {
    expect(showHouseholdPicker(false, dogs)).toBe(false);
    expect(showHouseholdPicker(true, dogs)).toBe(true);
    expect(bookingDogs(dogs, { isStaff: false, petParentId: 4 }).map(dog => dog.name)).toEqual([
      'Kiki',
      'Noodle',
    ]);
    expect(bookingDogs(dogs, { isStaff: true }).map(dog => dog.id)).toEqual([1, 2, 3]);
  });

  it('surfaces the household rejection from the API', () => {
    expect(availabilityFailureMessage({ dogs: 'Dogs must belong to one pet parent.' })).toBe(
      'Dogs must belong to one pet parent.',
    );
    expect(availabilityFailureMessage(null)).toBe('Could not load availability for this month.');
  });
});

describe('rangeBlockMessage', () => {
  const days = {
    '2026-11-02': open,
    '2026-11-03': joinable,
    '2026-11-04': open,
  };

  it('keeps a daycare day and a multi-day open range', () => {
    expect(rangeBlockMessage('2026-11-02', '2026-11-02', days, 'daycare')).toBeNull();
    expect(rangeBlockMessage('2026-11-02', '2026-11-04', days, 'daycare')).toBeNull();
    expect(eachIsoDate('2026-11-02', '2026-11-04')).toEqual([
      '2026-11-02',
      '2026-11-03',
      '2026-11-04',
    ]);
  });

  it('rejects same-day boarding and asks for a later checkout', () => {
    expect(rangeBlockMessage('2026-11-02', '2026-11-02', days, 'boarding')).toBe(
      BOARDING_SAME_DAY_MESSAGE,
    );
    expect(rangeBlockMessage('2026-11-02', '2026-11-04', days, 'boarding')).toBeNull();
  });

  it('lists each month in a stay that crosses the new year', () => {
    expect(monthsBetween('2026-11-15', '2027-01-02')).toEqual([
      { year: 2026, month: 10 },
      { year: 2026, month: 11 },
      { year: 2027, month: 0 },
    ]);
  });

  it('names a closed day ahead of a booked day', () => {
    expect(CLOSED_RANGE_MESSAGE).toMatch(/daycare is closed/i);
    expect(BOOKED_RANGE_MESSAGE).toMatch(/already booked/i);
    expect(dayStatePhrase('closed')).toBe('the daycare is closed');
    expect(dayStatePhrase('unavailable')).toBe('already booked');
    expect(
      rangeBlockMessage('2026-11-02', '2026-11-04', { ...days, '2026-11-03': booked }, 'daycare'),
    ).toBe(BOOKED_RANGE_MESSAGE);
    expect(
      rangeBlockMessage(
        '2026-11-02',
        '2026-11-04',
        { ...days, '2026-11-03': closed, '2026-11-04': booked },
        'daycare',
      ),
    ).toBe(CLOSED_RANGE_MESSAGE);
  });

  it('keeps a one-day walk and rejects a multi-day drop-in', () => {
    expect(rangeBlockMessage('2026-11-02', '2026-11-02', days, 'walk')).toBeNull();
    expect(rangeBlockMessage('2026-11-02', '2026-11-03', days, 'drop_in')).toBe(
      VISIT_RANGE_MESSAGE,
    );
  });

  it('treats yesterday as past and today as current', () => {
    const today = new Date(2026, 10, 2);
    expect(isPastIsoDate('2026-11-01', today)).toBe(true);
    expect(isPastIsoDate('2026-11-02', today)).toBe(false);
    expect(isPastIsoDate('2026-11-03', today)).toBe(false);
  });
});
