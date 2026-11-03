import { act, fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import { ACCOUNT_PATH } from '@/consts/routes';
import { useAuth } from '@/contexts/AuthContext';
import {
  createSiteImage,
  deleteSiteImage,
  listSiteImages,
  updateSiteImage,
} from '@/lib/daycareApi';
import StaffImagesPage from './StaffImagesPage';
import { siteImageErrorText, sortOrderSwapPatches } from './site-images';

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
    listSiteImages: jest.fn(),
    createSiteImage: jest.fn(),
    updateSiteImage: jest.fn(),
    deleteSiteImage: jest.fn(),
  };
});

const homeSlides = [
  {
    id: 1,
    placement: 'home_slide',
    alt: 'First',
    sort_order: 0,
    image_url: '/api/daycare/images/1/',
  },
  {
    id: 2,
    placement: 'home_slide',
    alt: 'Second',
    sort_order: 1,
    image_url: '/api/daycare/images/2/',
  },
];

function renderPage() {
  return render(
    <ThemeProvider theme={createTheme()}>
      <StaffImagesPage />
    </ThemeProvider>,
  );
}

describe('site image staff helpers', () => {
  it('swaps sort order and keeps each alt', () => {
    expect(sortOrderSwapPatches(homeSlides[0], homeSlides[1])).toEqual([
      { id: 1, body: { alt: 'First', sort_order: 1 } },
      { id: 2, body: { alt: 'Second', sort_order: 0 } },
    ]);
  });

  it('reads a file validation error the way other panels read field errors', () => {
    expect(
      siteImageErrorText({ file: ['File too large. Maximum size is 5 MB.'] }, 'Fallback'),
    ).toBe('File too large. Maximum size is 5 MB.');
    expect(siteImageErrorText({ detail: 'Staff only.' }, 'Fallback')).toBe('Staff only.');
    expect(siteImageErrorText(null, 'Fallback')).toBe('Fallback');
  });
});

describe('StaffImagesPage', () => {
  const replace = jest.fn();

  beforeEach(() => {
    replace.mockReset();
    useRouter.mockReturnValue({ replace });
    useAuth.mockReturnValue({
      token: 'staff-token',
      user: { isStaff: true, firstName: 'Carrie' },
      logout: jest.fn(),
    });
    listSiteImages.mockImplementation(async placement => {
      if (placement === 'home_slide') return { ok: true, status: 200, data: [] };
      return { ok: true, status: 200, data: [] };
    });
    createSiteImage.mockResolvedValue({ ok: true, status: 201, data: { id: 3 } });
    updateSiteImage.mockResolvedValue({ ok: true, status: 200, data: {} });
    deleteSiteImage.mockResolvedValue({ ok: true, status: 204, data: null });
  });

  it('sends a signed-in pet parent to their account', () => {
    useAuth.mockReturnValue({
      token: 'parent-token',
      user: { isStaff: false },
      logout: jest.fn(),
    });
    renderPage();
    expect(replace).toHaveBeenCalledWith(ACCOUNT_PATH);
    expect(screen.queryByRole('heading', { name: 'Site images' })).not.toBeInTheDocument();
  });

  it('says the public pages keep their built-in photos until the first save', async () => {
    renderPage();
    expect(
      screen.queryByText(
        'The public gallery still uses the built-in photos until the first image is saved.',
      ),
    ).not.toBeInTheDocument();
    expect(
      await screen.findByText(
        'The public home page still uses the built-in photos until the first image is saved.',
      ),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Gallery' }));
    expect(
      await screen.findByText(
        'The public gallery still uses the built-in photos until the first image is saved.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        'The public home page still uses the built-in photos until the first image is saved.',
      ),
    ).not.toBeInTheDocument();
  });

  it('shows the API error text when a placement fails to load', async () => {
    listSiteImages.mockImplementation(async placement => {
      if (placement === 'gallery') {
        return { ok: false, status: 400, data: { detail: 'Gallery unavailable.' } };
      }
      return { ok: true, status: 200, data: [] };
    });
    renderPage();
    expect(screen.queryByText('Gallery unavailable.')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Gallery' }));
    expect(await screen.findByText('Gallery unavailable.')).toBeInTheDocument();
  });

  it('patches both rows when a slide moves down', async () => {
    listSiteImages.mockImplementation(async placement => {
      if (placement === 'home_slide') return { ok: true, status: 200, data: homeSlides };
      return { ok: true, status: 200, data: [] };
    });
    renderPage();
    const moveDown = await screen.findByRole('button', { name: 'Move down First' });
    await act(async () => {
      fireEvent.click(moveDown);
    });
    expect(updateSiteImage).toHaveBeenNthCalledWith(1, 'staff-token', 1, {
      alt: 'First',
      sort_order: 1,
    });
    expect(updateSiteImage).toHaveBeenNthCalledWith(2, 'staff-token', 2, {
      alt: 'Second',
      sort_order: 0,
    });
  });

  it('posts a new gallery image and surfaces a file error', async () => {
    createSiteImage.mockResolvedValue({
      ok: false,
      status: 400,
      data: { file: ['Upload a JPEG, PNG, WEBP, or GIF under 5 MB.'] },
    });
    renderPage();
    fireEvent.click(screen.getByRole('tab', { name: 'Gallery' }));
    fireEvent.click(await screen.findByRole('button', { name: 'New image' }));
    const fileInput = await screen.findByLabelText('Choose image for Gallery');
    const file = new File(['hi'], 'dog.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, {
      target: { files: [file] },
    });
    fireEvent.change(screen.getByLabelText('Alt text'), {
      target: { value: 'Bear' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Add image' }));
    });
    expect(createSiteImage).toHaveBeenCalledWith('staff-token', {
      file,
      alt: 'Bear',
      placement: 'gallery',
    });
    expect(screen.getByText('Upload a JPEG, PNG, WEBP, or GIF under 5 MB.')).toBeInTheDocument();
  });
});
