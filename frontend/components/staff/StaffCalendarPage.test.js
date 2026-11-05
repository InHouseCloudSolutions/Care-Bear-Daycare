import { fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import { ACCOUNT_PATH } from '@/consts/routes';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeContext } from '@/contexts/ThemeContext';
import {
  listBookings,
  listClosures,
  listDogs,
  listPetParents,
  listServices,
} from '@/lib/daycareApi';
import StaffCalendarPage from './StaffCalendarPage';
import { todayIso } from './staff-desk';
import {
  calendarViewFromQuery,
  monthGrid,
  periodLabel,
  shiftAnchor,
  startOfWeek,
  stayCoversDay,
  staysCoveringDay,
} from './staff-calendar';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/daycareApi', () => {
  const actual = jest.requireActual('@/lib/daycareApi');
  return {
    ...actual,
    listBookings: jest.fn(),
    listServices: jest.fn(),
    listPetParents: jest.fn(),
    listDogs: jest.fn(),
    listClosures: jest.fn(),
  };
});

const confirmed = {
  id: 10,
  pet_parent_id: 1,
  service_id: 1,
  dogs: [3],
  status: 'confirmed',
  starts_on: '2026-11-02',
  ends_on: '2026-11-04',
};

const declined = {
  id: 11,
  pet_parent_id: 1,
  service_id: 1,
  dogs: [9],
  status: 'declined',
  starts_on: '2026-11-02',
  ends_on: '2026-11-04',
};

function renderCalendar() {
  return render(
    <ThemeContext.Provider value={{ mode: 'light', setMode: jest.fn() }}>
      <ThemeProvider theme={createTheme()}>
        <StaffCalendarPage />
      </ThemeProvider>
    </ThemeContext.Provider>,
  );
}

describe('staff calendar helpers', () => {
  const anchor = new Date(2026, 10, 4);

  it('covers a stay on inclusive ISO dates', () => {
    expect(stayCoversDay(confirmed, '2026-11-02')).toBe(true);
    expect(stayCoversDay(confirmed, '2026-11-04')).toBe(true);
    expect(stayCoversDay(confirmed, '2026-11-01')).toBe(false);
    expect(stayCoversDay(confirmed, '2026-11-05')).toBe(false);
  });

  it('starts the week on Sunday', () => {
    expect(startOfWeek(anchor).getDay()).toBe(0);
    expect(todayIso(startOfWeek(anchor))).toBe('2026-11-01');
    expect(todayIso(startOfWeek(new Date(2026, 10, 1)))).toBe('2026-11-01');
  });

  it('fills the month grid with whole Sunday weeks', () => {
    const november = monthGrid(anchor);
    expect(november).toHaveLength(35);
    expect(november[0].getDay()).toBe(0);
    expect(november[november.length - 1].getDay()).toBe(6);
    expect(todayIso(november[0])).toBe('2026-11-01');
    expect(todayIso(november[november.length - 1])).toBe('2026-12-05');

    const october = monthGrid(new Date(2026, 9, 15));
    expect(october[0].getDay()).toBe(0);
    expect(todayIso(october[0])).toBe('2026-09-27');
    expect(todayIso(october[october.length - 1])).toBe('2026-10-31');
  });

  it('shifts the anchor by day, week, and month without changing it', () => {
    expect(todayIso(shiftAnchor(anchor, 'day', 1))).toBe('2026-11-05');
    expect(todayIso(shiftAnchor(anchor, 'day', -1))).toBe('2026-11-03');
    expect(todayIso(shiftAnchor(anchor, 'week', 1))).toBe('2026-11-11');
    expect(todayIso(shiftAnchor(anchor, 'week', -1))).toBe('2026-10-28');
    expect(todayIso(shiftAnchor(anchor, 'month', 1))).toBe('2026-12-04');
    expect(todayIso(shiftAnchor(anchor, 'month', -1))).toBe('2026-10-04');
    expect(todayIso(shiftAnchor(new Date(2026, 0, 31), 'month', 1))).toBe('2026-02-28');
    expect(todayIso(anchor)).toBe('2026-11-04');
  });

  it('hides declined and cancelled stays', () => {
    const stays = staysCoveringDay(
      [
        confirmed,
        { id: 2, status: 'requested', starts_on: '2026-11-04', ends_on: '2026-11-04', dogs: [] },
        declined,
        { id: 4, status: 'cancelled', starts_on: '2026-11-04', ends_on: '2026-11-04', dogs: [] },
        { id: 5, status: 'checked_in', starts_on: '2026-11-04', ends_on: '2026-11-04', dogs: [] },
      ],
      '2026-11-04',
    );
    expect(stays.map(stay => stay.id).sort((a, b) => a - b)).toEqual([2, 5, 10]);
  });

  it('labels the visible period and reads the view query', () => {
    expect(periodLabel(anchor, 'month')).toBe('November 2026');
    expect(periodLabel(anchor, 'week')).toBe('Nov 1 – 7, 2026');
    expect(periodLabel(anchor, 'day')).toBe('Nov 4, 2026');
    expect(calendarViewFromQuery('?view=week')).toBe('week');
    expect(calendarViewFromQuery('')).toBe('month');
  });
});

describe('StaffCalendarPage', () => {
  const replace = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers({
      now: new Date(2026, 10, 4),
      doNotFake: [
        'nextTick',
        'queueMicrotask',
        'setImmediate',
        'clearImmediate',
        'setInterval',
        'clearInterval',
        'setTimeout',
        'clearTimeout',
      ],
    });
    jest.clearAllMocks();
    window.history.replaceState(null, '', '/staff/calendar');
    useRouter.mockReturnValue({ replace });
    useAuth.mockReturnValue({
      token: 'staff-token',
      user: { isStaff: true, firstName: 'Chris' },
      logout: jest.fn(),
    });
    listBookings.mockResolvedValue({ ok: true, data: [confirmed, declined] });
    listPetParents.mockResolvedValue({
      ok: true,
      data: [{ id: 1, first_name: 'Ada', last_name: 'Lovelace', email: 'ada@example.com' }],
    });
    listDogs.mockResolvedValue({
      ok: true,
      data: [
        { id: 3, name: 'Bear', pet_parent_id: 1 },
        { id: 9, name: 'Shadow', pet_parent_id: 1 },
      ],
    });
    listServices.mockResolvedValue({
      ok: true,
      data: [{ id: 1, name: 'Daycare', kind: 'daycare', active: true }],
    });
    listClosures.mockResolvedValue({ ok: true, data: [] });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows Bear on the month grid and hides a declined stay', async () => {
    renderCalendar();
    expect(await screen.findByText('November 2026')).toBeInTheDocument();
    expect((await screen.findAllByText('Bear')).length).toBeGreaterThan(0);
    expect(screen.queryByText('Shadow')).not.toBeInTheDocument();
  });

  it('still shows Bear in week and day views', async () => {
    renderCalendar();
    await screen.findAllByText('Bear');
    fireEvent.click(screen.getByRole('button', { name: 'Week' }));
    expect(screen.getByText('Nov 1 – 7, 2026')).toBeInTheDocument();
    expect(screen.getAllByText('Bear').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: 'Day' }));
    expect(screen.getByText('Nov 4, 2026')).toBeInTheDocument();
    expect(screen.getByText('Bear')).toBeInTheDocument();
    expect(screen.getByText('Confirmed')).toBeInTheDocument();
    expect(screen.queryByText('Shadow')).not.toBeInTheDocument();
    expect(screen.queryByText('Declined')).not.toBeInTheDocument();
  });

  it('sends a signed-in pet parent to their account', () => {
    useAuth.mockReturnValue({
      token: 'parent-token',
      user: { isStaff: false },
      logout: jest.fn(),
    });
    renderCalendar();
    expect(replace).toHaveBeenCalledWith(ACCOUNT_PATH);
    expect(screen.queryByRole('heading', { name: 'Calendar' })).not.toBeInTheDocument();
  });
});
