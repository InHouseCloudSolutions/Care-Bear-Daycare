import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useAuth } from '@/contexts/AuthContext';
import { listDogs } from '@/lib/daycareApi';
import AccountProfilePage from './AccountProfilePage';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/daycareApi', () => {
  const actual = jest.requireActual('@/lib/daycareApi');
  return {
    ...actual,
    listDogs: jest.fn(),
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
    expect(listDogs).not.toHaveBeenCalled();
  });
});
