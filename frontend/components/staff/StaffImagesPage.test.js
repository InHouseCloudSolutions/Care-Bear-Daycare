import { act, fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import { ACCOUNT_PATH } from '@/consts/routes';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeContext } from '@/contexts/ThemeContext';
import {
  createSiteImage,
  deleteSiteImage,
  listBookings,
  listClosures,
  listDogs,
  listPetParents,
  listServices,
  listSiteImages,
  replaceSiteImage,
  updateSiteImage,
} from '@/lib/daycareApi';
import StaffDeskPage from './StaffDeskPage';
import {
  reorderPatches,
  siteImageErrorText,
  siteImageFileProblem,
  sortOrderSwapPatches,
} from './site-images';

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
    replaceSiteImage: jest.fn(),
    updateSiteImage: jest.fn(),
    deleteSiteImage: jest.fn(),
    listBookings: jest.fn(),
    listPetParents: jest.fn(),
    listDogs: jest.fn(),
    listServices: jest.fn(),
    listClosures: jest.fn(),
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
    <ThemeContext.Provider value={{ mode: 'light', setMode: jest.fn() }}>
      <ThemeProvider theme={createTheme()}>
        <StaffDeskPage />
      </ThemeProvider>
    </ThemeContext.Provider>,
  );
}

/** jsdom reports empty rects, so keyboard reorder cannot see the card below. */
function stubSortableCardRects() {
  const original = Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect = function patchedRect() {
    if (this.tagName === 'LI' && this.parentElement && this.parentElement.tagName === 'OL') {
      const index = Array.prototype.indexOf.call(this.parentElement.children, this);
      const top = index * 220;
      const width = 320;
      const height = 200;
      return {
        x: 0,
        y: top,
        top,
        left: 0,
        right: width,
        bottom: top + height,
        width,
        height,
        toJSON() {
          return this;
        },
      };
    }
    return original.call(this);
  };
  return () => {
    Element.prototype.getBoundingClientRect = original;
  };
}

function openHomeSlides() {
  fireEvent.click(screen.getByRole('tab', { name: 'Home page slides' }));
}

describe('site image staff helpers', () => {
  it('swaps sort order and keeps each alt', () => {
    expect(sortOrderSwapPatches(homeSlides[0], homeSlides[1])).toEqual([
      { id: 1, body: { alt: 'First', sort_order: 1 } },
      { id: 2, body: { alt: 'Second', sort_order: 0 } },
    ]);
  });

  it('patches only the rows whose slot changes when a photo is dragged several places', () => {
    const rows = [
      { id: 'a', alt: 'A', sort_order: 10 },
      { id: 'b', alt: 'B', sort_order: 20 },
      { id: 'c', alt: 'C', sort_order: 30 },
      { id: 'd', alt: 'D', sort_order: 40 },
    ];
    expect(reorderPatches(rows, 0, 2)).toEqual([
      { id: 'b', body: { alt: 'B', sort_order: 10 } },
      { id: 'c', body: { alt: 'C', sort_order: 20 } },
      { id: 'a', body: { alt: 'A', sort_order: 30 } },
    ]);
  });

  it('falls back to 0..n-1 when sort orders collide', () => {
    const rows = [
      { id: 1, alt: '', sort_order: 0 },
      { id: 2, alt: '', sort_order: 0 },
      { id: 3, alt: '', sort_order: 0 },
    ];
    // Photo 3 already holds slot 0, so only the two rows behind it are patched.
    expect(reorderPatches(rows, 2, 0)).toEqual([
      { id: 1, body: { alt: '', sort_order: 1 } },
      { id: 2, body: { alt: '', sort_order: 2 } },
    ]);
  });

  it('flags the wrong file type before size', () => {
    expect(siteImageFileProblem(new File(['x'], 'a.pdf', { type: 'application/pdf' }))).toBe(
      'Upload a JPEG, PNG, WEBP, or GIF.',
    );
    expect(siteImageFileProblem(new File(['x'], 'a.jpg', { type: 'image/jpeg' }))).toBeNull();
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
    window.history.replaceState(null, '', '/staff');
    useRouter.mockReturnValue({ replace });
    useAuth.mockReturnValue({
      token: 'staff-token',
      user: { isStaff: true, firstName: 'Carrie' },
      logout: jest.fn(),
    });
    listBookings.mockResolvedValue({ ok: true, data: [] });
    listPetParents.mockResolvedValue({ ok: true, data: [] });
    listDogs.mockResolvedValue({ ok: true, data: [] });
    listServices.mockResolvedValue({ ok: true, data: [] });
    listClosures.mockResolvedValue({ ok: true, data: [] });
    listSiteImages.mockImplementation(async placement => {
      if (placement === 'home_slide') return { ok: true, status: 200, data: [] };
      return { ok: true, status: 200, data: [] };
    });
    createSiteImage.mockResolvedValue({ ok: true, status: 201, data: { id: 3 } });
    replaceSiteImage.mockResolvedValue({
      ok: true,
      status: 200,
      data: { id: 1, image_url: '/api/daycare/images/1/?v=2' },
    });
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
      screen.queryByText(
        'The public home page still uses the built-in photos until the first image is saved.',
      ),
    ).not.toBeInTheDocument();
    openHomeSlides();
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
    const restoreRects = stubSortableCardRects();
    try {
      renderPage();
      openHomeSlides();
      const handle = await screen.findByRole('button', { name: 'Drag to reorder First' });
      await act(async () => {
        handle.focus();
        fireEvent.keyDown(handle, { code: 'Space', key: ' ' });
      });
      await act(async () => {
        await new Promise(resolve => {
          setTimeout(resolve, 20);
        });
      });
      await act(async () => {
        document.dispatchEvent(
          new KeyboardEvent('keydown', {
            code: 'ArrowDown',
            key: 'ArrowDown',
            bubbles: true,
            cancelable: true,
          }),
        );
      });
      await act(async () => {
        document.dispatchEvent(
          new KeyboardEvent('keydown', {
            code: 'Space',
            key: ' ',
            bubbles: true,
            cancelable: true,
          }),
        );
      });
      expect(updateSiteImage).toHaveBeenNthCalledWith(1, 'staff-token', 1, {
        alt: 'First',
        sort_order: 1,
      });
      expect(updateSiteImage).toHaveBeenNthCalledWith(2, 'staff-token', 2, {
        alt: 'Second',
        sort_order: 0,
      });
    } finally {
      restoreRects();
    }
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

  it('uploads a photo over 5 MB instead of rejecting it', async () => {
    renderPage();
    openHomeSlides();
    fireEvent.click(await screen.findByRole('button', { name: 'New image' }));
    const fileInput = await screen.findByLabelText('Choose image for Home page slides');
    const file = new File(['hi'], 'yard.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 20 * 1024 * 1024 });
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(screen.queryByText(/MB or smaller/)).not.toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Add image' }));
    });
    expect(createSiteImage).toHaveBeenCalledWith('staff-token', {
      file,
      alt: '',
      placement: 'home_slide',
    });
  });

  it('still refuses a photo the browser cannot shrink when it is over 40 MB', async () => {
    renderPage();
    openHomeSlides();
    fireEvent.click(await screen.findByRole('button', { name: 'New image' }));
    const fileInput = await screen.findByLabelText('Choose image for Home page slides');
    const file = new File(['hi'], 'party.gif', { type: 'image/gif' });
    Object.defineProperty(file, 'size', { value: 41 * 1024 * 1024 });
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });
    expect(screen.getByText('Image must be 40 MB or smaller.')).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Add image' }));
    });
    expect(createSiteImage).not.toHaveBeenCalled();
  });

  it('replaces a home slide photo without sending alt text or sort order', async () => {
    listSiteImages.mockImplementation(async placement => {
      if (placement === 'home_slide') return { ok: true, status: 200, data: homeSlides };
      return { ok: true, status: 200, data: [] };
    });
    renderPage();
    openHomeSlides();
    fireEvent.click(await screen.findByRole('button', { name: 'Actions for First' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Replace image for First' }));
    expect(await screen.findByRole('heading', { name: /Replace photo/ })).toBeInTheDocument();
    expect(screen.queryByLabelText('Alt text')).not.toBeInTheDocument();
    const fileInput = screen.getByLabelText('Choose image for Home page slides');
    const file = new File(['hi'], 'yard.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    updateSiteImage.mockClear();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Replace image' }));
    });
    expect(replaceSiteImage).toHaveBeenCalledWith('staff-token', 1, file);
    expect(updateSiteImage).not.toHaveBeenCalled();
    expect(await screen.findByText('Photo replaced')).toBeInTheDocument();
  });

  it('keeps the slide in place when replacing the photo fails', async () => {
    listSiteImages.mockImplementation(async placement => {
      if (placement === 'home_slide') return { ok: true, status: 200, data: homeSlides };
      return { ok: true, status: 200, data: [] };
    });
    replaceSiteImage.mockResolvedValue({
      ok: false,
      status: 400,
      data: { file: ['Upload a JPEG, PNG, WEBP, or GIF under 5 MB.'] },
    });
    renderPage();
    openHomeSlides();
    fireEvent.click(await screen.findByRole('button', { name: 'Actions for Second' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Replace image for Second' }));
    const file = new File(['hi'], 'yard.jpg', { type: 'image/jpeg' });
    fireEvent.change(await screen.findByLabelText('Choose image for Home page slides'), {
      target: { files: [file] },
    });
    const loadsBefore = listSiteImages.mock.calls.length;
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Replace image' }));
    });
    expect(replaceSiteImage).toHaveBeenCalledWith('staff-token', 2, file);
    expect(updateSiteImage).not.toHaveBeenCalled();
    expect(listSiteImages).toHaveBeenCalledTimes(loadsBefore);
    expect(screen.getByText('Upload a JPEG, PNG, WEBP, or GIF under 5 MB.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Replace image' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { hidden: true, name: 'Actions for Second' }),
    ).toBeInTheDocument();
  });

  it('asks before removing a photo', async () => {
    listSiteImages.mockImplementation(async placement => {
      if (placement === 'home_slide') return { ok: true, status: 200, data: homeSlides };
      return { ok: true, status: 200, data: [] };
    });
    renderPage();
    openHomeSlides();
    fireEvent.click(await screen.findByRole('button', { name: 'Actions for Second' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Delete Second' }));
    expect(deleteSiteImage).not.toHaveBeenCalled();
    expect(await screen.findByText('Remove this photo?')).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Remove photo' }));
    });
    expect(deleteSiteImage).toHaveBeenCalledWith('staff-token', 2);
  });

  it('flags photos that are missing alt text', async () => {
    listSiteImages.mockImplementation(async placement => {
      if (placement === 'home_slide') {
        return { ok: true, status: 200, data: [{ ...homeSlides[0], alt: '' }, homeSlides[1]] };
      }
      return { ok: true, status: 200, data: [] };
    });
    renderPage();
    openHomeSlides();
    expect(await screen.findByText('Needs alt text')).toBeInTheDocument();
    expect(screen.getByText('1 photo still needs alt text.')).toBeInTheDocument();
  });
});
