import { fireEvent, render, screen } from '@testing-library/react';
import { useAuth } from '@/contexts/AuthContext';
import MarketingAccountControl from './MarketingAccountControl';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('./home-landing-font', () => ({
  HOME_LANDING_FONT_FAMILY: 'Nunito, sans-serif',
  homeMontserrat: { className: 'font' },
}));

function authState(overrides) {
  useAuth.mockReturnValue({
    isAuthenticated: true,
    loading: false,
    user: { isStaff: false, username: 'alex' },
    petParent: { first_name: 'Alex', last_name: 'Morgan', email: 'alex@example.com' },
    logout: jest.fn(),
    ...overrides,
  });
}

describe('MarketingAccountControl', () => {
  it('keeps the account menu for pet parents', () => {
    authState();
    render(<MarketingAccountControl />);
    fireEvent.click(screen.getByRole('button', { name: 'Account menu for Alex Morgan' }));
    expect(screen.getByRole('link', { name: 'Your account' })).toHaveAttribute('href', '/account');
    expect(screen.queryByRole('link', { name: 'Staff portal' })).not.toBeInTheDocument();
  });

  it('opens the account avatar and links the menu item to the staff portal', () => {
    authState({
      user: { isStaff: true, username: 'chris' },
      petParent: null,
    });
    render(<MarketingAccountControl />);
    expect(screen.queryByRole('link', { name: 'Staff portal' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Account menu for chris' }));
    expect(screen.getByRole('link', { name: 'Staff portal' })).toHaveAttribute('href', '/staff');
    expect(screen.queryByRole('link', { name: 'Your account' })).not.toBeInTheDocument();
  });
});
