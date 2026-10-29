import {
  BOOKED_RANGE_MESSAGE,
  BOARDING_SAME_DAY_MESSAGE,
  CLOSED_RANGE_MESSAGE,
  VISIT_RANGE_MESSAGE,
  dayStatePhrase,
  eachIsoDate,
  isPastIsoDate,
  monthsBetween,
  rangeBlockMessage,
} from './booking-dates';

const open = { state: 'open', reason: null };
const joinable = { state: 'joinable', reason: null };
const booked = { state: 'unavailable', reason: 'booked' };
const closed = { state: 'closed', reason: 'closed' };

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
