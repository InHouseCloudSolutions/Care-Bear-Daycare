import { act, fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import HolidayForm from './HolidayForm';

function renderForm(ui) {
  return render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>);
}

describe('HolidayForm', () => {
  it('rejects an end date before the start date and submits the closure body', async () => {
    const onSubmit = jest.fn().mockResolvedValue({ ok: true, data: { id: 1 } });
    renderForm(<HolidayForm onSubmit={onSubmit} submitLabel="Add holiday" />);

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Christmas' } });
    fireEvent.change(screen.getByLabelText(/Start date/i), { target: { value: '2026-12-26' } });
    fireEvent.change(screen.getByLabelText(/End date/i), { target: { value: '2026-12-24' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add holiday' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('End date must be on or after the start date.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Start date/i), { target: { value: '2026-12-24' } });
    fireEvent.change(screen.getByLabelText(/End date/i), { target: { value: '2026-12-26' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Add holiday' }));
    });

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Christmas',
      starts_on: '2026-12-24',
      ends_on: '2026-12-26',
    });
  });
});
