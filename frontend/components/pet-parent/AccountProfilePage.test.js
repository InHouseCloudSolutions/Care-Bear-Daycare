import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useAuth } from '@/contexts/AuthContext';
import { formatDateRange } from '@/components/staff/staff-desk';
import { listBookings, listCareUpdates, listDogs } from '@/lib/daycareApi';
import AccountProfilePage from './AccountProfilePage';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/daycareApi', () => {
  const actual = jest.requireActual('@/lib/daycareApi');
  return {
    ...actual,
    listDogs: jest.fn(),
    listBookings: jest.fn(),
    listCareUpdates: jest.fn(),
    updateMyProfile: jest.fn(),
    uploadMyPhoto: jest.fn(),
    deleteMyPhoto: jest.fn(),
    createDog: jest.fn(),
  };
});

jest.mock('@/components/dog-hotel/DogHotelInteriorPage', () => ({
  __esModule: true,
  default: function Interior({ children }) {
    return children;
  },
}));

const parent = {
  id: 4,
  first_name: 'Alex',
  last_name: 'Morgan',
  email: 'alex@example.com',
  phone: '647-555-0136',
  address: '',
  city: 'Toronto',
};

function renderAccount() {
  return render(
    <ThemeProvider theme={createTheme()}>
      <AccountProfilePage />
    </ThemeProvider>,
  );
}

describe('AccountProfilePage', () => {
  const logout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    listDogs.mockResolvedValue({ ok: true, data: [] });
    listBookings.mockResolvedValue({ ok: true, data: [] });
    listCareUpdates.mockResolvedValue({ ok: true, data: [] });
    useAuth.mockReturnValue({
      token: 'parent-token',
      loading: false,
      logout,
      refreshAuth: jest.fn(),
      user: { isStaff: false, firstName: 'Alex', username: 'alex@example.com' },
      petParent: parent,
    });
  });

  it('shows the account headings and hides the staff portal for pet parents', async () => {
    renderAccount();
    expect(await screen.findByRole('heading', { name: 'Your account' })).toBeInTheDocument();
    expect(screen.getByText('MY ACCOUNT')).toBeInTheDocument();
    expect(screen.getByText('Manage your details, dogs, and vaccine records.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Parent details' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Your dogs' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Book a stay/ })).toHaveAttribute(
      'href',
      '/account/book',
    );
    expect(screen.getByRole('link', { name: /Contact Carrie/ })).toHaveAttribute(
      'href',
      '/contact',
    );
    expect(screen.queryByRole('link', { name: 'Staff portal' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveValue('alex@example.com');
    expect(screen.getByLabelText('Email')).toBeDisabled();
    await waitFor(() => expect(listDogs).toHaveBeenCalledWith('parent-token'));
  });

  it('shows a staff portal link when the signed-in user is staff', async () => {
    useAuth.mockReturnValue({
      token: 'staff-token',
      loading: false,
      logout,
      refreshAuth: jest.fn(),
      user: { isStaff: true, firstName: 'Chris', username: 'chris' },
      petParent: parent,
    });
    renderAccount();
    expect(await screen.findByRole('link', { name: 'Staff portal' })).toHaveAttribute(
      'href',
      '/staff',
    );
    expect(screen.getByRole('heading', { name: 'Your account' })).toBeInTheDocument();
    expect(screen.getByText('Open the staff portal to manage the daycare.')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Your dogs' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Parent details' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Book a stay/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/no pet-parent profile/)).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Your stays' })).not.toBeInTheDocument();
    expect(listDogs).not.toHaveBeenCalled();
    expect(listBookings).not.toHaveBeenCalled();
  });

  it('shows a stay and its care update without a composer', async () => {
    listDogs.mockResolvedValue({
      ok: true,
      data: [{ id: 3, name: 'Bear', pet_parent_id: 4 }],
    });
    listBookings.mockResolvedValue({
      ok: true,
      data: [
        {
          id: 9,
          status: 'checked_in',
          starts_on: '2026-11-02',
          ends_on: '2026-11-04',
          dogs: [3],
        },
      ],
    });
    listCareUpdates.mockResolvedValue({
      ok: true,
      data: [
        {
          id: 2,
          booking: 9,
          author: 5,
          author_name: 'Chris C.',
          potty: true,
          food: false,
          play: true,
          meds_given: false,
          body: 'Played in the yard',
          created_at: '2026-11-02T18:00:00Z',
        },
      ],
    });
    renderAccount();
    expect(await screen.findByRole('heading', { name: 'Your stays' })).toBeInTheDocument();
    expect(screen.getByText('Checked in')).toBeInTheDocument();
    expect(screen.getByText(formatDateRange('2026-11-02', '2026-11-04'))).toBeInTheDocument();
    expect(screen.getAllByText('Bear').length).toBeGreaterThan(1);
    expect(await screen.findByText('Played in the yard')).toBeInTheDocument();
    expect(screen.getByText(/Chris C\./)).toBeInTheDocument();
    expect(screen.getByText(/Potty yes/)).toBeInTheDocument();
    expect(screen.getByText(/Food no/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save update' })).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(listCareUpdates).toHaveBeenCalledWith('parent-token', 9);
  });
});
