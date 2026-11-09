import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeContext } from '@/contexts/ThemeContext';
import {
  addBookingExtra,
  createClosure,
  createExtra,
  createPetParent,
  deleteBookingExtra,
  deleteDog,
  deletePetParent,
  fetchBookingPreview,
  listBookings,
  listClosures,
  listDogs,
  listExtras,
  listPetParents,
  listServices,
  listVaccines,
  updateBooking,
  updateExtra,
  uploadDogPhoto,
  uploadPetParentPhoto,
} from '@/lib/daycareApi';
import StaffDeskPage from './StaffDeskPage';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/components/pet-parent/frame-photo', () => {
  const actual = jest.requireActual('@/components/pet-parent/frame-photo');
  return {
    ...actual,
    exportFramedPhoto: jest.fn(
      async (_image, _layout, name) =>
        new File(['framed'], name || 'photo.webp', { type: 'image/webp' }),
    ),
  };
});

async function confirmFrame(dialog) {
  const img = dialog.querySelector('img');
  Object.defineProperty(img, 'naturalWidth', { configurable: true, get: () => 640 });
  Object.defineProperty(img, 'naturalHeight', { configurable: true, get: () => 480 });
  fireEvent.load(img);
  const save = within(dialog).getByRole('button', { name: 'Save photo' });
  await waitFor(() => expect(save).toBeEnabled());
  await act(async () => {
    fireEvent.click(save);
  });
}

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/daycareApi', () => {
  const actual = jest.requireActual('@/lib/daycareApi');
  return {
    ...actual,
    fetchBookingPreview: jest.fn(),
    listBookings: jest.fn(),
    listServices: jest.fn(),
    listPetParents: jest.fn(),
    listDogs: jest.fn(),
    listClosures: jest.fn(),
    listExtras: jest.fn(),
    listVaccines: jest.fn(),
    updateBooking: jest.fn(),
    createBooking: jest.fn(),
    createPetParent: jest.fn(),
    deletePetParent: jest.fn(),
    deleteDog: jest.fn(),
    uploadPetParentPhoto: jest.fn(),
    deletePetParentPhoto: jest.fn(),
    uploadDogPhoto: jest.fn(),
    deleteDogPhoto: jest.fn(),
    updatePetParent: jest.fn(),
    createDog: jest.fn(),
    updateDog: jest.fn(),
    createClosure: jest.fn(),
    updateClosure: jest.fn(),
    deleteClosure: jest.fn(),
    createService: jest.fn(),
    updateService: jest.fn(),
    deleteService: jest.fn(),
    createExtra: jest.fn(),
    updateExtra: jest.fn(),
    deleteExtra: jest.fn(),
    addBookingExtra: jest.fn(),
    deleteBookingExtra: jest.fn(),
    listSiteImages: jest.fn().mockResolvedValue({ ok: true, data: [] }),
  };
});

const ada = { id: 1, first_name: 'Ada', last_name: 'Lovelace', email: 'ada@example.com' };
const request = {
  id: 10,
  pet_parent_id: 1,
  service_id: 1,
  dogs: [3],
  status: 'requested',
  starts_on: '2026-11-02',
  ends_on: '2026-11-04',
};

function renderDesk() {
  return render(
    <ThemeContext.Provider value={{ mode: 'light', setMode: jest.fn() }}>
      <ThemeProvider theme={createTheme()}>
        <StaffDeskPage />
      </ThemeProvider>
    </ThemeContext.Provider>,
  );
}

describe('StaffDeskPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    URL.createObjectURL = jest.fn(() => 'blob:preview');
    URL.revokeObjectURL = jest.fn();
    window.history.replaceState(null, '', '/staff');
    useRouter.mockReturnValue({ replace: jest.fn() });
    useAuth.mockReturnValue({
      token: 'staff-token',
      user: { isStaff: true, firstName: 'Chris' },
      logout: jest.fn(),
    });
    listBookings.mockResolvedValue({ ok: true, data: [request] });
    fetchBookingPreview.mockResolvedValue({
      ok: true,
      status: 200,
      data: '<html><body>Invoice for Bear</body></html>',
    });
    listServices.mockResolvedValue({
      ok: true,
      data: [
        { id: 1, name: 'Daycare', kind: 'daycare', rate: '35.00', rate_unit: 'day', active: true },
      ],
    });
    listPetParents.mockResolvedValue({ ok: true, data: [ada] });
    listDogs.mockResolvedValue({ ok: true, data: [{ id: 3, name: 'Bear', pet_parent_id: 1 }] });
    listClosures.mockResolvedValue({ ok: true, data: [] });
    listExtras.mockResolvedValue({ ok: true, data: [] });
    listVaccines.mockResolvedValue({ ok: true, data: [] });
    updateBooking.mockResolvedValue({ ok: true, data: { ...request, status: 'confirmed' } });
  });

  it('loads hidden services so staff can turn them back on', async () => {
    listServices.mockResolvedValue({
      ok: true,
      data: [
        {
          id: 1,
          name: 'Daycare',
          kind: 'daycare',
          rate: '35.00',
          rate_unit: 'day',
          slug: 'daycare',
          active: true,
        },
        {
          id: 2,
          name: 'Boarding',
          kind: 'boarding',
          rate: '55.00',
          rate_unit: 'night',
          slug: 'boarding',
          active: false,
        },
      ],
    });
    renderDesk();
    fireEvent.click(screen.getByRole('tab', { name: /Services/ }));
    const boarding = await screen.findByRole('checkbox', { name: 'Boarding bookable' });
    expect(boarding).not.toBeChecked();
    expect(listServices).toHaveBeenCalledWith('staff-token', { all: true });
  });

  it('shows the shared staff header and the waiting request', async () => {
    renderDesk();
    expect(screen.getByRole('heading', { level: 1, name: 'Staff desk' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Care Bear Daycare' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /Calendar/ })).toHaveAttribute(
      'href',
      expect.stringContaining('calendar'),
    );
    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
    expect(await screen.findByText('Bear')).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Manage requests, arrivals, and pickups.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Active 1' })).toBeInTheDocument();
    expect(screen.getByText('Check-in')).toBeInTheDocument();
    expect(screen.getByText('Nov 2, 2026')).toBeInTheDocument();
    expect(screen.getByText('Checkout')).toBeInTheDocument();
    expect(screen.getByText('Nov 4, 2026')).toBeInTheDocument();
    expect(screen.getByText('Daycare')).toBeInTheDocument();
    expect(screen.queryByText('in care', { exact: true })).not.toBeInTheDocument();
  });

  it('groups a checked-in stay under in care and checks it out', async () => {
    const stay = {
      id: 11,
      pet_parent_id: 1,
      service_id: 1,
      dogs: [3],
      status: 'checked_in',
      starts_on: '2026-10-29',
      ends_on: '2026-11-19',
      est_checkin_start: '13:00:00',
      est_checkin_end: '14:00:00',
      est_checkout_start: '10:00:00',
      est_checkout_end: '11:00:00',
      parent_note: 'Three dogs boarded from Rover.',
      charge: '120.00',
    };
    listBookings.mockResolvedValue({ ok: true, data: [stay] });
    updateBooking.mockResolvedValue({ ok: true, data: { ...stay, status: 'completed' } });
    renderDesk();

    expect(await screen.findByText('in care', { exact: true })).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Checked in')).toBeInTheDocument();
    expect(screen.getByText('Oct 29, 2026')).toBeInTheDocument();
    expect(screen.getByText('Expected 1:00 PM – 2:00 PM')).toBeInTheDocument();
    expect(screen.getByText('Nov 19, 2026')).toBeInTheDocument();
    expect(screen.getByText('Expected 10:00 AM – 11:00 AM')).toBeInTheDocument();
    expect(screen.getByText('Three dogs boarded from Rover.')).toBeInTheDocument();
    expect(screen.getByText('Per day $120.00')).toBeInTheDocument();
    expect(screen.queryByText(/Morning/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Stay options for Ada Lovelace' }));
    const checkOut = screen.getByRole('menuitem', { name: 'Check out' });
    await act(async () => {
      fireEvent.click(checkOut);
    });
    expect(updateBooking).toHaveBeenCalledWith('staff-token', 11, { status: 'completed' });
  });

  it('offers home page slides and gallery beside the other desk tabs', () => {
    renderDesk();
    expect(screen.getByRole('tab', { name: 'Home page slides' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Gallery' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Home page slides' })).toHaveAttribute(
      'id',
      'desk-home_slide-tab',
    );
    expect(screen.getByRole('tab', { name: 'Gallery' })).toHaveAttribute('id', 'desk-gallery-tab');
  });

  it('confirms a requested stay and reloads', async () => {
    renderDesk();
    fireEvent.click(await screen.findByRole('button', { name: 'Stay options for Ada Lovelace' }));
    const confirm = screen.getByRole('menuitem', { name: 'Confirm' });
    await act(async () => {
      fireEvent.click(confirm);
    });
    expect(updateBooking).toHaveBeenCalledWith('staff-token', 10, { status: 'confirmed' });
    expect(listBookings).toHaveBeenCalledTimes(2);
  });

  it('edits, deletes, and books from the household actions menu', async () => {
    deletePetParent.mockResolvedValue({ ok: true, status: 204, data: null });
    renderDesk();
    fireEvent.click(screen.getByRole('tab', { name: /Households/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Open Ada Lovelace' }));
    expect(await screen.findByRole('heading', { name: 'Parent details' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Your dogs' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Staff portal' })).not.toBeInTheDocument();
    fireEvent.click(await screen.findByRole('button', { name: 'Actions for Ada Lovelace' }));
    expect(screen.getByRole('menuitem', { name: 'Book a stay' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));
    const dialog = await screen.findByRole('dialog', { name: 'Delete Ada Lovelace?' });
    await act(async () => {
      fireEvent.click(within(dialog).getByRole('button', { name: 'Delete household' }));
    });
    expect(deletePetParent).toHaveBeenCalledWith('staff-token', 1);
  });

  it('uploads a household photo and a dog photo', async () => {
    uploadPetParentPhoto.mockResolvedValue({
      ok: true,
      data: { id: 1, photo_url: '/api/daycare/images/4/' },
    });
    uploadDogPhoto.mockResolvedValue({
      ok: true,
      data: { id: 3, name: 'Bear', photo_url: '/api/daycare/images/5/' },
    });
    renderDesk();
    fireEvent.click(screen.getByRole('tab', { name: /Households/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Open Ada Lovelace' }));

    fireEvent.click(await screen.findByRole('button', { name: 'Change photo for Ada Lovelace' }));
    const parentPhoto = new File(['ada'], 'ada.png', { type: 'image/png' });
    const parentInput = screen.getByLabelText('Photo file for Ada Lovelace', { hidden: true });
    fireEvent.change(parentInput, { target: { files: [parentPhoto] } });
    await confirmFrame(await screen.findByRole('dialog', { name: 'Frame photo' }));
    await waitFor(() =>
      expect(uploadPetParentPhoto).toHaveBeenCalledWith('staff-token', 1, expect.any(File)),
    );
    expect(await screen.findByText('Ada Lovelace photo saved.')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Frame photo' })).not.toBeInTheDocument(),
    );

    expect(screen.getByRole('button', { name: '+ Add vaccine' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Actions for Bear' }));
    expect(screen.getByRole('menuitem', { name: 'Edit profile' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Change photo' }));
    const dogPhoto = new File(['bear'], 'bear.png', { type: 'image/png' });
    const dogInput = screen.getByLabelText('Photo file for Bear', { hidden: true });
    fireEvent.change(dogInput, { target: { files: [dogPhoto] } });
    await confirmFrame(await screen.findByRole('dialog', { name: 'Frame photo' }));
    await waitFor(() =>
      expect(uploadDogPhoto).toHaveBeenCalledWith('staff-token', 3, expect.any(File)),
    );
    expect(await screen.findByText('Bear photo saved.')).toBeInTheDocument();
  }, 15000);

  it('deletes a dog from the household', async () => {
    deleteDog.mockResolvedValue({ ok: true, status: 204, data: null });
    renderDesk();
    fireEvent.click(screen.getByRole('tab', { name: /Households/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Open Ada Lovelace' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Actions for Bear' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Remove' }));
    const dialog = await screen.findByRole('dialog', { name: 'Delete Bear?' });
    await act(async () => {
      fireEvent.click(within(dialog).getByRole('button', { name: 'Delete dog' }));
    });
    expect(deleteDog).toHaveBeenCalledWith('staff-token', 3);
  });

  it('creates a household from the Households tab', async () => {
    createPetParent.mockResolvedValue({
      ok: true,
      data: { id: 2, first_name: 'Grace', last_name: 'Hopper', email: 'grace@example.com' },
    });
    renderDesk();
    fireEvent.click(screen.getByRole('tab', { name: /Households/ }));
    expect(window.location.search).toBe('?tab=households');
    fireEvent.click(await screen.findByRole('button', { name: 'New household' }));

    const dialog = await screen.findByRole('dialog', { name: 'New household' });
    fireEvent.change(within(dialog).getByLabelText(/First name/), { target: { value: 'Grace' } });
    fireEvent.change(within(dialog).getByLabelText(/^Email/), {
      target: { value: ' Grace@Example.com ' },
    });
    await act(async () => {
      fireEvent.click(within(dialog).getByRole('button', { name: 'Create household' }));
    });

    expect(createPetParent).toHaveBeenCalledWith(
      'staff-token',
      expect.objectContaining({ first_name: 'Grace', email: 'grace@example.com' }),
    );
    expect(createPetParent.mock.calls[0][1]).not.toHaveProperty('password');
    await waitFor(() => expect(listPetParents).toHaveBeenCalledTimes(2));
  });

  it('keeps a household dialog open and shows the server error', async () => {
    createPetParent.mockResolvedValue({
      ok: false,
      data: { email: ['A user with this email already exists.'] },
    });
    renderDesk();
    fireEvent.click(screen.getByRole('tab', { name: /Households/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'New household' }));
    const dialog = await screen.findByRole('dialog', { name: 'New household' });
    fireEvent.change(within(dialog).getByLabelText(/Last name/), { target: { value: 'Hopper' } });
    fireEvent.change(within(dialog).getByLabelText(/^Email/), {
      target: { value: 'ada@example.com' },
    });
    await act(async () => {
      fireEvent.click(within(dialog).getByRole('button', { name: 'Create household' }));
    });
    expect(within(dialog).getByText('A user with this email already exists.')).toBeInTheDocument();
  });

  it('adds a holiday and checks the dates first', async () => {
    createClosure.mockResolvedValue({ ok: true, data: { id: 5, name: 'Christmas' } });
    renderDesk();
    fireEvent.click(screen.getByRole('tab', { name: /Holidays/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'New holiday' }));
    const dialog = await screen.findByRole('dialog', { name: 'New holiday' });
    fireEvent.change(within(dialog).getByLabelText(/Name/), { target: { value: 'Christmas' } });
    fireEvent.change(within(dialog).getByLabelText(/^Start date/), {
      target: { value: '2026-12-26' },
    });
    fireEvent.change(within(dialog).getByLabelText(/^End date/), {
      target: { value: '2026-12-24' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Add holiday' }));
    expect(
      within(dialog).getByText('End date must be on or after the start date.'),
    ).toBeInTheDocument();
    expect(createClosure).not.toHaveBeenCalled();

    fireEvent.change(within(dialog).getByLabelText(/^End date/), {
      target: { value: '2026-12-27' },
    });
    await act(async () => {
      fireEvent.click(within(dialog).getByRole('button', { name: 'Add holiday' }));
    });
    expect(createClosure).toHaveBeenCalledWith('staff-token', {
      name: 'Christmas',
      starts_on: '2026-12-26',
      ends_on: '2026-12-27',
      kind: 'closed',
      surcharge_percent: null,
    });
  });

  it('adds an open surcharge holiday', async () => {
    createClosure.mockResolvedValue({
      ok: true,
      data: { id: 6, name: 'New Year', kind: 'surcharge', surcharge_percent: 15 },
    });
    renderDesk();
    fireEvent.click(screen.getByRole('tab', { name: /Holidays/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'New holiday' }));
    const dialog = await screen.findByRole('dialog', { name: 'New holiday' });
    fireEvent.change(within(dialog).getByLabelText(/Name/), { target: { value: 'New Year' } });
    fireEvent.mouseDown(within(dialog).getByLabelText(/^Type/));
    fireEvent.click(await screen.findByRole('option', { name: 'Open with % surcharge' }));
    fireEvent.change(within(dialog).getByLabelText(/^Surcharge/), { target: { value: '15' } });
    fireEvent.change(within(dialog).getByLabelText(/^Start date/), {
      target: { value: '2027-01-01' },
    });
    fireEvent.change(within(dialog).getByLabelText(/^End date/), {
      target: { value: '2027-01-01' },
    });
    await act(async () => {
      fireEvent.click(within(dialog).getByRole('button', { name: 'Add holiday' }));
    });
    expect(createClosure).toHaveBeenCalledWith('staff-token', {
      name: 'New Year',
      starts_on: '2027-01-01',
      ends_on: '2027-01-01',
      kind: 'surcharge',
      surcharge_percent: 15,
    });
  });

  it('manages the extras catalog: lists, toggles, and creates', async () => {
    listExtras.mockResolvedValue({
      ok: true,
      data: [
        { id: 1, name: 'Bath', unit_price: '25.00', active: true, kind: 'item' },
        {
          id: 2,
          name: 'Stay past 6pm',
          unit_price: '10.00',
          active: true,
          kind: 'late_checkout',
        },
      ],
    });
    updateExtra.mockResolvedValue({ ok: true, data: { id: 1, active: false } });
    createExtra.mockResolvedValue({
      ok: true,
      data: { id: 3, name: 'Nail trim', unit_price: '15.00', active: true, kind: 'item' },
    });
    renderDesk();
    fireEvent.click(screen.getByRole('tab', { name: /Extras/ }));
    expect(await screen.findByText('Bath')).toBeInTheDocument();
    expect(screen.getByText('Stay past 6pm')).toBeInTheDocument();
    expect(screen.getByText('Late checkout fee')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole('checkbox', { name: 'Bath active' }));
    });
    expect(updateExtra).toHaveBeenCalledWith('staff-token', 1, { active: false });

    fireEvent.click(screen.getByRole('button', { name: 'New extra' }));
    const dialog = await screen.findByRole('dialog', { name: 'New extra' });
    fireEvent.change(within(dialog).getByLabelText(/Name/), { target: { value: 'Nail trim' } });
    fireEvent.change(within(dialog).getByLabelText(/Unit price/), {
      target: { value: '15' },
    });
    await act(async () => {
      fireEvent.click(within(dialog).getByRole('button', { name: 'Create extra' }));
    });
    expect(createExtra).toHaveBeenCalledWith('staff-token', {
      name: 'Nail trim',
      unit_price: '15.00',
      kind: 'item',
      active: true,
    });
  });

  it('shows charge, extras, and total on a stay, and adds or removes a catalog item', async () => {
    const stay = {
      id: 12,
      pet_parent_id: 1,
      service_id: 1,
      dogs: [3],
      status: 'checked_in',
      starts_on: '2026-11-02',
      ends_on: '2026-11-04',
      charge: '105.00',
      checked_in_at: '2026-11-02T12:05:00Z',
      checked_out_at: null,
      extras: [
        {
          id: 1,
          extra_id: 3,
          description: 'Poop bags',
          quantity: 2,
          unit_price: '5.00',
          amount: '10.00',
          kind: 'item',
        },
      ],
      total: '115.00',
    };
    listBookings.mockResolvedValue({ ok: true, data: [stay] });
    listExtras.mockResolvedValue({
      ok: true,
      data: [{ id: 5, name: 'Bath', unit_price: '25.00', active: true, kind: 'item' }],
    });
    addBookingExtra.mockResolvedValue({ ok: true, data: { id: 2 } });
    deleteBookingExtra.mockResolvedValue({ ok: true, status: 204, data: null });
    renderDesk();

    expect(await screen.findByText('Per day $105.00')).toBeInTheDocument();
    expect(screen.getByText('Total $115.00')).toBeInTheDocument();
    expect(screen.getByText('Poop bags × 2 — $10.00')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Add item' }));
    const addDialog = await screen.findByRole('dialog', { name: 'Add an extra' });
    fireEvent.mouseDown(within(addDialog).getByLabelText(/^Item/));
    fireEvent.click(await screen.findByRole('option', { name: /Bath/ }));
    await act(async () => {
      fireEvent.click(within(addDialog).getByRole('button', { name: 'Add extra' }));
    });
    expect(addBookingExtra).toHaveBeenCalledWith('staff-token', 12, { extra_id: 5, quantity: 1 });
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Add an extra' })).not.toBeInTheDocument(),
    );

    fireEvent.click(
      await screen.findByRole('button', { name: 'Remove Poop bags' }, { timeout: 5000 }),
    );
    const removeDialog = await screen.findByRole('dialog', { name: 'Remove Poop bags?' });
    await act(async () => {
      fireEvent.click(within(removeDialog).getByRole('button', { name: 'Remove' }));
    });
    expect(deleteBookingExtra).toHaveBeenCalledWith('staff-token', 12, 1);
  });

  it('edits a stay and patches dates without status or household', async () => {
    const stay = {
      id: 14,
      pet_parent_id: 1,
      service_id: 1,
      dogs: [3],
      status: 'cancelled',
      starts_on: '2026-11-02',
      ends_on: '2026-11-04',
      charge: '105.00',
      parent_note: 'Gate code',
      est_checkin_start: null,
      est_checkin_end: null,
      est_checkout_start: null,
      est_checkout_end: null,
    };
    listBookings.mockResolvedValue({ ok: true, data: [stay] });
    updateBooking.mockResolvedValue({ ok: true, data: { ...stay, ends_on: '2026-11-05' } });
    renderDesk();

    fireEvent.click(await screen.findByRole('button', { name: 'Past 1' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Stay options for Ada Lovelace' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Edit stay for Ada Lovelace' }));
    const dialog = await screen.findByRole('dialog', { name: 'Edit stay' });
    expect(within(dialog).getByText('Household: Ada Lovelace')).toBeInTheDocument();
    expect(within(dialog).queryByLabelText('Household')).not.toBeInTheDocument();
    fireEvent.change(within(dialog).getByLabelText(/Checkout date/), {
      target: { value: '2026-11-05' },
    });
    await act(async () => {
      fireEvent.click(within(dialog).getByRole('button', { name: 'Save stay' }));
    });
    expect(updateBooking).toHaveBeenCalledWith('staff-token', 14, {
      service_id: 1,
      dogs: [3],
      starts_on: '2026-11-02',
      ends_on: '2026-11-05',
      est_checkin_start: null,
      est_checkin_end: null,
      est_checkout_start: null,
      est_checkout_end: null,
      parent_note: 'Gate code',
      charge: '105.00',
    });
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Edit stay' })).not.toBeInTheDocument(),
    );
    expect(listBookings).toHaveBeenCalledTimes(2);
    expect(await screen.findByText('Stay updated.')).toBeInTheDocument();
  });

  it('corrects check-in and checkout times on a stay', async () => {
    const stay = {
      id: 13,
      pet_parent_id: 1,
      service_id: 1,
      dogs: [3],
      status: 'checked_in',
      starts_on: '2026-11-02',
      ends_on: '2026-11-04',
      charge: '105.00',
      checked_in_at: '2026-11-02T12:05:00Z',
      checked_out_at: null,
      extras: [],
      total: '105.00',
    };
    listBookings.mockResolvedValue({ ok: true, data: [stay] });
    updateBooking.mockResolvedValue({
      ok: true,
      data: { ...stay, checked_in_at: '2026-11-02T11:00:00Z' },
    });
    renderDesk();

    fireEvent.click(await screen.findByRole('button', { name: 'Correct times' }));
    const dialog = await screen.findByRole('dialog', { name: 'Correct times' });
    fireEvent.change(within(dialog).getByLabelText(/Checked in at/), {
      target: { value: '2026-11-02T07:00' },
    });
    await act(async () => {
      fireEvent.click(within(dialog).getByRole('button', { name: 'Save times' }));
    });
    expect(updateBooking).toHaveBeenCalledWith(
      'staff-token',
      13,
      expect.objectContaining({ checked_in_at: expect.any(String) }),
    );
  });

  it('opens a booking preview in a new tab with the token kept off the URL', async () => {
    const previewWindow = {
      opener: window,
      close: jest.fn(),
      document: { open: jest.fn(), write: jest.fn(), close: jest.fn() },
    };
    const open = jest.spyOn(window, 'open').mockReturnValue(previewWindow);
    renderDesk();
    fireEvent.click(await screen.findByRole('button', { name: 'Stay options for Ada Lovelace' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Invoice' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Preview' }));
    expect(open).toHaveBeenCalledWith('', '_blank');
    await waitFor(() =>
      expect(fetchBookingPreview).toHaveBeenCalledWith('staff-token', 10, 'invoice'),
    );
    expect(previewWindow.document.write).toHaveBeenCalledWith(
      '<html><body>Invoice for Bear</body></html>',
    );
    expect(previewWindow.document.write.mock.calls[0][0]).not.toContain('staff-token');
    expect(previewWindow.close).not.toHaveBeenCalled();
    open.mockRestore();
  });

  it('shows a preview error and closes the blank tab when the booking is missing', async () => {
    const previewWindow = {
      opener: window,
      close: jest.fn(),
      document: { open: jest.fn(), write: jest.fn(), close: jest.fn() },
    };
    const open = jest.spyOn(window, 'open').mockReturnValue(previewWindow);
    fetchBookingPreview.mockResolvedValue({ ok: false, status: 404, data: '' });
    renderDesk();
    fireEvent.click(await screen.findByRole('button', { name: 'Stay options for Ada Lovelace' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Emails' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Request received (client)' }));
    expect(
      await screen.findByText('That booking could not be found, or this preview is not available.'),
    ).toBeInTheDocument();
    expect(previewWindow.document.write).not.toHaveBeenCalled();
    expect(previewWindow.close).toHaveBeenCalled();
    open.mockRestore();
  });

  it('does not offer stay documents when there are no bookings', async () => {
    listBookings.mockResolvedValue({ ok: true, data: [] });
    renderDesk();
    expect(await screen.findByText('No stays yet')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Stay options/ })).not.toBeInTheDocument();
  });

  it('sends a pet parent to their account', async () => {
    const replace = jest.fn();
    useRouter.mockReturnValue({ replace });
    useAuth.mockReturnValue({ token: 't', user: { isStaff: false }, logout: jest.fn() });
    await act(async () => {
      renderDesk();
    });
    expect(replace).toHaveBeenCalledWith('/account');
  });
});
