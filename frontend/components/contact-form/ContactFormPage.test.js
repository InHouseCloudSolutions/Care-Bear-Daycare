import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { submitContactInquiry } from '@/lib/daycareApi';
import ContactFormPage from './ContactFormPage';

jest.mock('@/components/home-landing/home-landing-data', () => ({
  HOME_BRAND: { name: 'Care Bear Daycare' },
  HOME_FOOTER: {
    placeLine: 'Toronto · Greater Toronto Area',
    webCredit: { label: 'Web', href: 'https://example.com' },
  },
}));

jest.mock('@/lib/daycareApi', () => {
  const actual = jest.requireActual('@/lib/daycareApi');
  return {
    ...actual,
    submitContactInquiry: jest.fn(),
  };
});

jest.mock('@/components/dog-hotel/DogHotelInteriorPage', () => ({
  __esModule: true,
  default: function DogHotelInteriorPage({ children }) {
    return <div data-testid="interior-shell">{children}</div>;
  },
}));

function renderContact() {
  return render(
    <ThemeProvider theme={createTheme()}>
      <ContactFormPage />
    </ThemeProvider>,
  );
}

describe('ContactFormPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the main heading and a contact mailto', () => {
    renderContact();

    expect(
      screen.getByRole('heading', { level: 1, name: "Let's talk about your dog." }),
    ).toBeInTheDocument();

    const emailLinks = screen.getAllByRole('link', { name: 'contact@carebeardaycare.ca' });
    expect(emailLinks.length).toBeGreaterThan(0);
    expect(emailLinks[0]).toHaveAttribute('href', expect.stringMatching(/^mailto:contact@/));
  });

  it('does not submit when required fields are empty', async () => {
    renderContact();

    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));

    await waitFor(() => {
      expect(screen.getByLabelText(/^Your name/)).toBeInvalid();
    });
    expect(screen.getByLabelText(/^Email address/)).toBeInvalid();
    expect(screen.getByText('Choose a topic.')).toBeInTheDocument();
    expect(screen.getByLabelText(/^Your message/)).toBeInvalid();
    expect(submitContactInquiry).not.toHaveBeenCalled();
  });

  it('shows confirmation after a successful submit', async () => {
    submitContactInquiry.mockResolvedValue({ ok: true, status: 201, data: { id: 1 } });

    renderContact();

    fireEvent.change(screen.getByLabelText(/^Your name/), {
      target: { value: 'Alex Owner' },
    });
    fireEvent.change(screen.getByLabelText(/^Email address/), {
      target: { value: 'alex@example.com' },
    });
    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'Daycare' }));
    fireEvent.change(screen.getByLabelText(/^Your message/), {
      target: { value: 'Can you fit two dogs?' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));

    await waitFor(() => {
      expect(screen.getByText('Message sent. Carrie will get back to you.')).toBeInTheDocument();
    });

    expect(submitContactInquiry).toHaveBeenCalledWith({
      name: 'Alex Owner',
      email: 'alex@example.com',
      dog_name: '',
      topic: 'daycare',
      message: 'Can you fit two dogs?',
    });
  });
});
