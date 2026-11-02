import { act, fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  listBookings,
  listDogs,
  listPetParents,
  listServices,
  updateBooking,
} from '@/lib/daycareApi';
import BookingPanel from './BookingPanel';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ token: 'staff-token', user: { isStaff: true } }),
}));

jest.mock('@/lib/daycareApi', () => {
  const actual = jest.requireActual('@/lib/daycareApi');
  return {
    ...actual,
    listBookings: jest.fn(),
    listServices: jest.fn(),
    listPetParents: jest.fn(),
    listDogs: jest.fn(),
    updateBooking: jest.fn(),
    createBooking: jest.fn(),
  };
});

const booking = {
  id: 10,
  pet_parent_id: 1,
  service_id: 1,
  dogs: [3],
  status: 'requested',
  starts_on: '2026-11-02',
  ends_on: '2026-11-04',
};

function renderPanel() {
  return render(
    <ThemeProvider theme={createTheme()}>
      <BookingPanel />
    </ThemeProvider>,
  );
}

describe('BookingPanel confirm', () => {
  beforeEach(() => {
    listBookings.mockResolvedValue({ ok: true, data: [booking] });
    listServices.mockResolvedValue({ ok: true, data: [{ id: 1, name: 'Daycare' }] });
    listPetParents.mockResolvedValue({
      ok: true,
      data: [{ id: 1, first_name: 'Ada', last_name: 'Lovelace', email: 'ada@example.com' }],
    });
    listDogs.mockResolvedValue({
      ok: true,
      data: [{ id: 3, name: 'Bear', pet_parent_id: 1 }],
    });
    updateBooking.mockResolvedValue({ ok: true, data: { ...booking, status: 'confirmed' } });
  });

  it('patches a requested stay to confirmed', async () => {
    renderPanel();
    const confirm = await screen.findByRole('button', { name: 'Confirm' });
    await act(async () => {
      fireEvent.click(confirm);
    });
    expect(updateBooking).toHaveBeenCalledWith('staff-token', 10, { status: 'confirmed' });
    expect(listBookings).toHaveBeenCalledTimes(2);
  });
});
