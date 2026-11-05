'use client';

import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  InputAdornment,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { formatApiErrors } from '@/lib/daycareApi';
import { FormDialog, GroupLabel, fieldGridSx, stackSx } from './DeskParts';
import {
  EXTRA_KINDS,
  HOLIDAY_KINDS,
  RATE_UNITS,
  SERVICE_KINDS,
  bookingExtraFormError,
  bookingExtraFormState,
  bookingExtraPayload,
  daySpan,
  extraFormError,
  extraFormState,
  extraPayload,
  holidayFormError,
  holidayPayload,
  householdFormError,
  householdFormState,
  householdLabel,
  householdPayload,
  moneyLabel,
  serviceFormError,
  serviceFormState,
  servicePayload,
  slugify,
  staffBookingBody,
  staffBookingFormError,
  timestampFormError,
  timestampFormState,
  timestampPayload,
} from './staff-desk';

const DATE_PROPS = { type: 'date', InputLabelProps: { shrink: true } };

/**
 * Form state, field errors and submit handling shared by every desk dialog.
 * `save(body)` must resolve to `{ ok, data }`; a 400 body is mapped onto fields.
 */
function useDialogForm(open, makeState) {
  const [form, setForm] = useState(makeState);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(makeState());
      setFieldErrors({});
      setError(null);
      setBusy(false);
    }
    // Reset only when the dialog opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = field => event => {
    const { type, checked, value } = event.target;
    setForm(prev => ({ ...prev, [field]: type === 'checkbox' ? checked : value }));
  };

  const submit = async (clientError, save, onDone, fallback) => {
    if (clientError) {
      setError(clientError);
      return;
    }
    setError(null);
    setFieldErrors({});
    setBusy(true);
    const res = await save();
    setBusy(false);
    if (res?.ok) {
      onDone(res.data);
      return;
    }
    const { summary, fields } = formatApiErrors(res?.data);
    setFieldErrors(fields);
    setError(summary || (Object.keys(fields).length ? 'Check the highlighted fields.' : fallback));
  };

  const fieldProps = (field, label, extra = {}) => ({
    label,
    value: form[field] ?? '',
    onChange: set(field),
    fullWidth: true,
    error: Boolean(fieldErrors[field]),
    helperText: fieldErrors[field] || extra.helperText,
    ...extra,
  });

  return { form, setForm, set, error, busy, submit, fieldProps, fieldErrors };
}

// --- Household ---

export function HouseholdDialog({ open, household, onClose, onSave, onSaved }) {
  const isNew = !household;
  const { form, error, busy, submit, fieldProps } = useDialogForm(open, () =>
    householdFormState(household),
  );

  return (
    <FormDialog
      open={open}
      title={isNew ? 'New household' : 'Edit household'}
      description={
        isNew
          ? 'Add a family and their contact details. You can add their dogs next.'
          : `Email: ${household.email}`
      }
      onClose={onClose}
      submitLabel={isNew ? 'Create household' : 'Save changes'}
      busy={busy}
      error={error}
      onSubmit={() =>
        submit(
          householdFormError(form, { isNew }),
          () => onSave(householdPayload(form, { isNew })),
          saved => onSaved(saved),
          'Could not save this household.',
        )
      }
    >
      <GroupLabel sx={{ mb: 1.5 }}>Parent</GroupLabel>
      <Box sx={fieldGridSx}>
        <TextField {...fieldProps('first_name', 'First name', { autoFocus: true })} />
        <TextField {...fieldProps('last_name', 'Last name')} />
        {isNew ? (
          <TextField
            {...fieldProps('email', 'Email', {
              type: 'email',
              required: true,
              autoComplete: 'off',
            })}
          />
        ) : null}
        <TextField {...fieldProps('phone', 'Phone', { type: 'tel' })} />
      </Box>

      <GroupLabel sx={{ mt: 3, mb: 1.5 }}>Address</GroupLabel>
      <Box sx={fieldGridSx}>
        <TextField {...fieldProps('address', 'Street address')} />
        <TextField {...fieldProps('city', 'City')} />
      </Box>

      <GroupLabel sx={{ mt: 3, mb: 1.5 }}>Emergency contact</GroupLabel>
      <Box sx={fieldGridSx}>
        <TextField {...fieldProps('emergency_name', 'Name')} />
        <TextField {...fieldProps('emergency_phone', 'Phone', { type: 'tel' })} />
      </Box>

      {isNew ? (
        <>
          <GroupLabel sx={{ mt: 3, mb: 1.5 }}>Sign-in</GroupLabel>
          <TextField
            {...fieldProps('password', 'Temporary password (optional)', {
              type: 'password',
              autoComplete: 'new-password',
              helperText:
                'Leave blank if the family won’t sign in yet. Without a password they can’t use their account.',
            })}
          />
        </>
      ) : null}
    </FormDialog>
  );
}

HouseholdDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  household: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
};

// --- Dog ---

const SEX_OPTIONS = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'unknown', label: 'Unknown' },
];

function dogFormState(dog) {
  return {
    name: dog?.name ?? '',
    breed: dog?.breed ?? '',
    sex: dog?.sex ?? 'unknown',
    weight_lb: dog?.weight_lb ?? '',
    birth_date: dog?.birth_date ?? '',
    spayed_neutered: Boolean(dog?.spayed_neutered),
    good_with_dogs: dog ? Boolean(dog.good_with_dogs) : true,
    vet_name: dog?.vet_name ?? '',
    vet_phone: dog?.vet_phone ?? '',
    medications: dog?.medications ?? '',
    feeding: dog?.feeding ?? '',
    temperament: dog?.temperament ?? '',
    notes: dog?.notes ?? '',
  };
}

export function DogDialog({ open, dog, householdName, onClose, onSave, onSaved }) {
  const isNew = !dog;
  const { form, error, busy, submit, fieldProps, set } = useDialogForm(open, () =>
    dogFormState(dog),
  );

  const save = () =>
    onSave({
      ...form,
      name: form.name.trim(),
      weight_lb: form.weight_lb === '' ? null : form.weight_lb,
      birth_date: form.birth_date === '' ? null : form.birth_date,
    });

  return (
    <FormDialog
      open={open}
      title={isNew ? 'Add a dog' : `Edit ${dog.name}`}
      description={householdName ? `Household: ${householdName}` : null}
      onClose={onClose}
      submitLabel={isNew ? 'Add dog' : 'Save dog'}
      busy={busy}
      error={error}
      onSubmit={() =>
        submit(
          form.name.trim() ? null : 'Name is required.',
          save,
          saved => onSaved(saved),
          'Could not save this dog.',
        )
      }
    >
      <GroupLabel sx={{ mb: 1.5 }}>About</GroupLabel>
      <Box sx={fieldGridSx}>
        <TextField {...fieldProps('name', 'Name', { required: true, autoFocus: true })} />
        <TextField {...fieldProps('breed', 'Breed')} />
        <TextField select {...fieldProps('sex', 'Sex')}>
          {SEX_OPTIONS.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          {...fieldProps('weight_lb', 'Weight', {
            type: 'number',
            inputProps: { min: 0, step: '0.1' },
            InputProps: { endAdornment: <InputAdornment position="end">lb</InputAdornment> },
          })}
        />
        <TextField {...fieldProps('birth_date', 'Birth date', DATE_PROPS)} />
      </Box>
      <FormGroup sx={{ mt: 1.5 }}>
        <FormControlLabel
          control={<Checkbox checked={form.spayed_neutered} onChange={set('spayed_neutered')} />}
          label="Spayed or neutered"
        />
        <FormControlLabel
          control={<Checkbox checked={form.good_with_dogs} onChange={set('good_with_dogs')} />}
          label="Good with other dogs"
        />
      </FormGroup>

      <GroupLabel sx={{ mt: 2.5, mb: 1.5 }}>Vet</GroupLabel>
      <Box sx={fieldGridSx}>
        <TextField {...fieldProps('vet_name', 'Vet name')} />
        <TextField {...fieldProps('vet_phone', 'Vet phone', { type: 'tel' })} />
      </Box>

      <GroupLabel sx={{ mt: 3, mb: 1.5 }}>Care</GroupLabel>
      <Box sx={stackSx(2)}>
        <TextField {...fieldProps('medications', 'Medications', { multiline: true, minRows: 2 })} />
        <TextField {...fieldProps('feeding', 'Feeding', { multiline: true, minRows: 2 })} />
        <TextField {...fieldProps('temperament', 'Temperament', { multiline: true, minRows: 2 })} />
        <TextField {...fieldProps('notes', 'Notes', { multiline: true, minRows: 2 })} />
      </Box>
    </FormDialog>
  );
}

DogDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  dog: PropTypes.object,
  householdName: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
};

// --- Stay ---

export function StayDialog({
  open,
  parents,
  dogs,
  services,
  presetParentId,
  onClose,
  onSave,
  onSaved,
}) {
  const { form, setForm, error, busy, submit, fieldProps, fieldErrors } = useDialogForm(
    open,
    () => ({
      petParentId: presetParentId != null ? String(presetParentId) : '',
      serviceId: '',
      dogIds: [],
      startsOn: '',
      endsOn: '',
    }),
  );

  const activeServices = useMemo(
    () => services.filter(service => service.active !== false),
    [services],
  );
  const householdDogs = useMemo(
    () =>
      form.petParentId === ''
        ? []
        : dogs.filter(dog => dog.pet_parent_id === Number(form.petParentId)),
    [dogs, form.petParentId],
  );
  const span = daySpan(form.startsOn, form.endsOn);

  const toggleDog = id =>
    setForm(prev => ({
      ...prev,
      dogIds: prev.dogIds.includes(id) ? prev.dogIds.filter(x => x !== id) : [...prev.dogIds, id],
    }));

  return (
    <FormDialog
      open={open}
      title="New stay"
      description="Stays you create here are confirmed straight away."
      onClose={onClose}
      submitLabel="Create stay"
      busy={busy}
      error={error}
      onSubmit={() =>
        submit(
          staffBookingFormError(form),
          () => onSave(staffBookingBody(form)),
          saved => onSaved(saved),
          'Could not create that stay.',
        )
      }
    >
      <Box sx={stackSx(2)}>
        <TextField
          select
          {...fieldProps('petParentId', 'Household', {
            required: true,
            error: Boolean(fieldErrors.pet_parent_id),
            helperText: fieldErrors.pet_parent_id,
          })}
          onChange={event =>
            setForm(prev => ({ ...prev, petParentId: event.target.value, dogIds: [] }))
          }
        >
          {parents.length === 0 ? (
            <MenuItem value="" disabled>
              No households yet
            </MenuItem>
          ) : null}
          {parents.map(parent => (
            <MenuItem key={parent.id} value={String(parent.id)}>
              {householdLabel(parent)}
            </MenuItem>
          ))}
        </TextField>

        {form.petParentId ? (
          <Box>
            <GroupLabel>Dogs</GroupLabel>
            {householdDogs.length === 0 ? (
              <Typography sx={{ mt: 1, color: 'text.secondary', fontSize: 14 }}>
                This household has no dogs yet. Add one from the Households tab first.
              </Typography>
            ) : (
              <FormGroup row sx={{ mt: 0.5 }}>
                {householdDogs.map(dog => (
                  <FormControlLabel
                    key={dog.id}
                    control={
                      <Checkbox
                        checked={form.dogIds.includes(dog.id)}
                        onChange={() => toggleDog(dog.id)}
                      />
                    }
                    label={dog.name}
                  />
                ))}
              </FormGroup>
            )}
            {fieldErrors.dogs ? <FormHelperText error>{fieldErrors.dogs}</FormHelperText> : null}
          </Box>
        ) : null}

        <TextField
          select
          {...fieldProps('serviceId', 'Service', {
            required: true,
            error: Boolean(fieldErrors.service_id),
            helperText: fieldErrors.service_id,
          })}
        >
          {activeServices.map(service => (
            <MenuItem key={service.id} value={String(service.id)}>
              {service.name}
            </MenuItem>
          ))}
        </TextField>

        <Box sx={fieldGridSx}>
          <TextField
            {...fieldProps('startsOn', 'Start date', {
              ...DATE_PROPS,
              required: true,
              error: Boolean(fieldErrors.starts_on),
              helperText: fieldErrors.starts_on,
            })}
          />
          <TextField
            {...fieldProps('endsOn', 'End date', {
              ...DATE_PROPS,
              required: true,
              inputProps: { min: form.startsOn || undefined },
              error: Boolean(fieldErrors.ends_on),
              helperText:
                fieldErrors.ends_on || (span > 0 ? `${span} day${span === 1 ? '' : 's'}` : ''),
            })}
          />
        </Box>
      </Box>
    </FormDialog>
  );
}

StayDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  parents: PropTypes.array.isRequired,
  dogs: PropTypes.array.isRequired,
  services: PropTypes.array.isRequired,
  presetParentId: PropTypes.number,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
};

// --- Holiday ---

export function HolidayDialog({ open, holiday, onClose, onSave, onSaved }) {
  const isNew = !holiday;
  const { form, error, busy, submit, fieldProps, fieldErrors } = useDialogForm(open, () => ({
    name: holiday?.name ?? '',
    startsOn: holiday?.starts_on ?? '',
    endsOn: holiday?.ends_on ?? '',
    kind: holiday?.kind === 'surcharge' ? 'surcharge' : 'closed',
    surchargePercent:
      holiday?.kind === 'surcharge' && holiday?.surcharge_percent != null
        ? String(holiday.surcharge_percent)
        : '',
  }));
  const isSurcharge = form.kind === 'surcharge';

  return (
    <FormDialog
      open={open}
      title={isNew ? 'New holiday' : 'Edit holiday'}
      description={
        isSurcharge
          ? 'Days stay bookable. The surcharge applies to the whole stay when dates overlap.'
          : 'Every day in the range is closed for all services, including stays you book.'
      }
      onClose={onClose}
      submitLabel={isNew ? 'Add holiday' : 'Save holiday'}
      busy={busy}
      error={error}
      maxWidth="xs"
      onSubmit={() =>
        submit(
          holidayFormError(form),
          () => onSave(holidayPayload(form)),
          saved => onSaved(saved),
          'Could not save this holiday.',
        )
      }
    >
      <Box sx={stackSx(2)}>
        <TextField
          {...fieldProps('name', 'Name', {
            required: true,
            autoFocus: true,
            inputProps: { maxLength: 80 },
          })}
        />
        <TextField select {...fieldProps('kind', 'Type', { required: true })}>
          {HOLIDAY_KINDS.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        {isSurcharge ? (
          <TextField
            {...fieldProps('surchargePercent', 'Surcharge', {
              type: 'number',
              required: true,
              inputProps: { min: 0, max: 100, step: 1 },
              InputProps: {
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              },
              error: Boolean(fieldErrors.surchargePercent || fieldErrors.surcharge_percent),
              helperText:
                fieldErrors.surchargePercent ||
                fieldErrors.surcharge_percent ||
                '0–100. Applied to the whole booking when dates overlap.',
            })}
          />
        ) : null}
        <TextField {...fieldProps('startsOn', 'Start date', { ...DATE_PROPS, required: true })} />
        <TextField
          {...fieldProps('endsOn', 'End date', {
            ...DATE_PROPS,
            required: true,
            inputProps: { min: form.startsOn || undefined },
          })}
        />
      </Box>
    </FormDialog>
  );
}

HolidayDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  holiday: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
};

// --- Service ---

export function ServiceDialog({ open, service, onClose, onSave, onSaved }) {
  const isNew = !service;
  const { form, setForm, set, error, busy, submit, fieldProps, fieldErrors } = useDialogForm(
    open,
    () => serviceFormState(service),
  );
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (open) setSlugTouched(!isNew);
  }, [open, isNew]);

  return (
    <FormDialog
      open={open}
      title={isNew ? 'New service' : `Edit ${service.name}`}
      onClose={onClose}
      submitLabel={isNew ? 'Create service' : 'Save service'}
      busy={busy}
      error={error}
      onSubmit={() =>
        submit(
          serviceFormError(form),
          () => onSave(servicePayload(form)),
          saved => onSaved(saved),
          'Could not save this service.',
        )
      }
    >
      <Box sx={fieldGridSx}>
        <TextField
          {...fieldProps('name', 'Name', { required: true, autoFocus: true })}
          onChange={event => {
            const { value } = event.target;
            setForm(prev => ({
              ...prev,
              name: value,
              slug: slugTouched ? prev.slug : slugify(value),
            }));
          }}
        />
        <TextField
          {...fieldProps('slug', 'Web name (slug)', {
            helperText: 'Lowercase letters, numbers and hyphens.',
          })}
          onChange={event => {
            setSlugTouched(true);
            setForm(prev => ({ ...prev, slug: event.target.value }));
          }}
        />
        <TextField
          select
          {...fieldProps('kind', 'Kind')}
          onChange={event => {
            const kind = SERVICE_KINDS.find(item => item.value === event.target.value);
            setForm(prev => ({
              ...prev,
              kind: event.target.value,
              rate_unit: kind?.unit || prev.rate_unit,
            }));
          }}
        >
          {SERVICE_KINDS.map(kind => (
            <MenuItem key={kind.value} value={kind.value}>
              {kind.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          {...fieldProps('rate', 'Rate', {
            type: 'number',
            required: true,
            inputProps: { min: 0, step: '0.01' },
            InputProps: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
          })}
        />
        <TextField select {...fieldProps('rate_unit', 'Charged')}>
          {RATE_UNITS.map(unit => (
            <MenuItem key={unit.value} value={unit.value}>
              {unit.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          {...fieldProps('max_dogs_per_day', 'Dogs per day', {
            type: 'number',
            inputProps: { min: 1, step: 1 },
            helperText:
              form.kind === 'daycare' || form.kind === 'boarding'
                ? 'Daycare and boarding share one pool; this cap is not used.'
                : 'Blank means no cap.',
          })}
        />
      </Box>

      <GroupLabel sx={{ mt: 3, mb: 0.5 }}>Expected windows</GroupLabel>
      <Typography sx={{ color: 'text.secondary', fontSize: 13, mb: 1.5 }}>
        Informational only, shown to staff on each stay. Leave blank for no set window.
      </Typography>
      <Box sx={fieldGridSx}>
        <TextField
          {...fieldProps('check_in_from', 'Check-in from', {
            type: 'time',
            InputLabelProps: { shrink: true },
          })}
        />
        <TextField
          {...fieldProps('check_in_until', 'Check-in until', {
            type: 'time',
            InputLabelProps: { shrink: true },
          })}
        />
        <TextField
          {...fieldProps('check_out_from', 'Check-out from', {
            type: 'time',
            InputLabelProps: { shrink: true },
          })}
        />
        <TextField
          {...fieldProps('check_out_until', 'Check-out until', {
            type: 'time',
            InputLabelProps: { shrink: true },
            helperText: fieldErrors.check_out_until || 'Drives the late-checkout fee.',
          })}
        />
      </Box>

      <FormControlLabel
        sx={{ mt: 2.5 }}
        control={<Switch checked={form.active} onChange={set('active')} />}
        label={form.active ? 'Bookable now' : 'Hidden from booking'}
      />
    </FormDialog>
  );
}

ServiceDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  service: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
};

// --- Extra (catalog) ---

export function ExtraDialog({ open, extra, onClose, onSave, onSaved }) {
  const isNew = !extra;
  const { form, set, error, busy, submit, fieldProps } = useDialogForm(open, () =>
    extraFormState(extra),
  );

  return (
    <FormDialog
      open={open}
      title={isNew ? 'New extra' : `Edit ${extra.name}`}
      onClose={onClose}
      submitLabel={isNew ? 'Create extra' : 'Save extra'}
      busy={busy}
      error={error}
      maxWidth="xs"
      onSubmit={() =>
        submit(
          extraFormError(form),
          () => onSave(extraPayload(form)),
          saved => onSaved(saved),
          'Could not save this extra.',
        )
      }
    >
      <Box sx={stackSx(2)}>
        <TextField {...fieldProps('name', 'Name', { required: true, autoFocus: true })} />
        <TextField
          {...fieldProps('unit_price', 'Unit price', {
            type: 'number',
            required: true,
            inputProps: { min: 0, step: '0.01' },
            InputProps: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
          })}
        />
        <TextField select {...fieldProps('kind', 'Kind')}>
          {EXTRA_KINDS.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>
      <FormControlLabel
        sx={{ mt: 1.5 }}
        control={<Switch checked={form.active} onChange={set('active')} />}
        label={form.active ? 'Active' : 'Inactive'}
      />
    </FormDialog>
  );
}

ExtraDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  extra: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
};

// --- Correct check-in / checkout times ---

export function TimestampDialog({ open, booking, onClose, onSave, onSaved }) {
  const { form, error, busy, submit, fieldProps } = useDialogForm(open, () =>
    timestampFormState(booking),
  );

  return (
    <FormDialog
      open={open}
      title="Correct times"
      description="Check-in and checkout are stamped automatically. Use this to fix a mistake."
      onClose={onClose}
      submitLabel="Save times"
      busy={busy}
      error={error}
      maxWidth="xs"
      onSubmit={() =>
        submit(
          timestampFormError(form),
          () => onSave(timestampPayload(form)),
          saved => onSaved(saved),
          'Could not save those times.',
        )
      }
    >
      <Box sx={stackSx(2)}>
        <TextField
          {...fieldProps('checkedInAt', 'Checked in at', {
            type: 'datetime-local',
            InputLabelProps: { shrink: true },
          })}
        />
        <TextField
          {...fieldProps('checkedOutAt', 'Checked out at', {
            type: 'datetime-local',
            InputLabelProps: { shrink: true },
          })}
        />
      </Box>
    </FormDialog>
  );
}

TimestampDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  booking: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
};

// --- Add a catalog item to a booking ---

export function AddBookingExtraDialog({ open, items, onClose, onSave, onSaved }) {
  const { form, error, busy, submit, fieldProps, fieldErrors } = useDialogForm(open, () =>
    bookingExtraFormState(),
  );

  return (
    <FormDialog
      open={open}
      title="Add an extra"
      onClose={onClose}
      submitLabel="Add extra"
      busy={busy}
      error={error}
      maxWidth="xs"
      onSubmit={() =>
        submit(
          bookingExtraFormError(form),
          () => onSave(bookingExtraPayload(form)),
          saved => onSaved(saved),
          'Could not add that extra.',
        )
      }
    >
      <Box sx={stackSx(2)}>
        <TextField
          select
          {...fieldProps('extraId', 'Item', {
            required: true,
            autoFocus: true,
            error: Boolean(fieldErrors.extra_id),
            helperText: fieldErrors.extra_id,
          })}
        >
          {items.length === 0 ? (
            <MenuItem value="" disabled>
              No active items in the catalog
            </MenuItem>
          ) : null}
          {items.map(item => (
            <MenuItem key={item.id} value={String(item.id)}>
              {item.name} ({moneyLabel(item.unit_price)})
            </MenuItem>
          ))}
        </TextField>
        <TextField
          {...fieldProps('quantity', 'Quantity', {
            type: 'number',
            inputProps: { min: 1, step: 1 },
            error: Boolean(fieldErrors.quantity),
            helperText: fieldErrors.quantity,
          })}
        />
      </Box>
    </FormDialog>
  );
}

AddBookingExtraDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  items: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
};
