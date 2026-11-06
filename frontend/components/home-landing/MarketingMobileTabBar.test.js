import { render, screen } from '@testing-library/react';
import { useAuth } from '@/contexts/AuthContext';
import MarketingMobileTabBar from './MarketingMobileTabBar';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

function authState(overrides) {
  useAuth.mockReturnValue({
    isAuthenticated: true,
    loading: false,
    user: { isStaff: false, username: 'alex' },
    petParent: null,
    logout: jest.fn(),
    ...overrides,
  });
}

describe('MarketingMobileTabBar', () => {
  it('shows Account for pet parents', () => {
    authState();
    render(<MarketingMobileTabBar />);
    expect(screen.getByRole('link', { name: 'Account' })).toHaveAttribute('href', '/account');
    expect(screen.queryByRole('link', { name: 'Staff portal' })).not.toBeInTheDocument();
  });

  it('replaces Account with Staff portal for staff', () => {
    authState({ user: { isStaff: true, username: 'chris' } });
    render(<MarketingMobileTabBar />);
    expect(screen.getByRole('link', { name: 'Staff portal' })).toHaveAttribute('href', '/staff');
    expect(screen.queryByRole('link', { name: 'Account' })).not.toBeInTheDocument();
  });
});
