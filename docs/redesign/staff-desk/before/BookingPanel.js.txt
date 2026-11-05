'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Typography,
} from '@mui/material';
import GlassFormField from '@/components/design-studio/GlassFormField';
import { useAuth } from '@/contexts/AuthContext';
import { dogsForHousehold } from '@/components/pet-parent/booking-dates';
import { PRIMARY_BUTTON_SX, SECONDARY_BUTTON_SX } from '@/components/pet-parent/pet-parent-styles';
import {
  createBooking,
  formatApiErrors,
  listBookings,
  listDogs,
  listPetParents,
  listServices,
  updateBooking,
} from '@/lib/daycareApi';
import {
  asRecordList,
  bookingStatusPatch,
  householdLabel,
  staffBookingBody,
  staffBookingFormError,
} from './staff-desk';

const DATE_FIELD_PROPS = { InputLabelProps: { shrink: true } };

function lookupName(rows, id, fallback) {
  const match = rows.find(row => row.id === id);
  return match ? fallback(match) : null;
}

export default function BookingPanel() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [parents, setParents] = useState([]);
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [pendingId, setPendingId] = useState(null);
  const [rowError, setRowError] = useState(null);

  const [petParentId, setPetParentId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [dogIds, setDogIds] = useState([]);
  const [startsOn, setStartsOn] = useState('');
  const [endsOn, setEndsOn] = useState('');
  const [formError, setFormError] = useState(null);
  const [formSummary, setFormSummary] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [bookingsRes, servicesRes, parentsRes, dogsRes] = await Promise.all([
      listBookings(token),
      listServices(token),
      listPetParents(token),
      listDogs(token),
    ]);
    setLoading(false);

    const bookingRows = asRecordList(bookingsRes.data);
    const serviceRows = asRecordList(servicesRes.data);
    const parentRows = asRecordList(parentsRes.data);
    const dogRows = asRecordList(dogsRes.data);
    const failed = [];
    if (!bookingsRes.ok || !bookingRows) failed.push('bookings');
    if (!servicesRes.ok || !serviceRows) failed.push('services');
    if (!parentsRes.ok || !parentRows) failed.push('households');
    if (!dogsRes.ok || !dogRows) failed.push('dogs');

    setBookings(bookingRows || []);
    setServices(serviceRows || []);
    setParents(parentRows || []);
    setDogs(dogRows || []);
    setLoadError(failed.length ? `Could not load ${failed.join(', ')}.` : null);
  }, [token]);

  useEffect(() => {
    if (token) load();
  }, [token, load]);

  const householdDogs = useMemo(
    () => dogsForHousehold(dogs, petParentId === '' ? null : Number(petParentId)),
    [dogs, petParentId],
  );

  const setStatus = async (booking, status) => {
    setRowError(null);
    setPendingId(booking.id);
    const res = await updateBooking(token, booking.id, bookingStatusPatch(status));
    setPendingId(null);
    if (!res.ok) {
      const { summary } = formatApiErrors(res.data);
      setRowError(summary || 'Could not update that stay.');
      return;
    }
    await load();
  };

  const toggleDog = dogId => {
    setDogIds(current =>
      current.includes(dogId) ? current.filter(id => id !== dogId) : [...current, dogId],
    );
  };

  const handleCreate = async event => {
    event.preventDefault();
    const clientError = staffBookingFormError({
      petParentId,
      serviceId,
      dogIds,
      startsOn,
      endsOn,
    });
    if (clientError) {
      setFormError(clientError);
      setFormSummary(null);
      return;
    }
    setFormError(null);
    setFormSummary(null);
    setSubmitting(true);
    const res = await createBooking(
      token,
      staffBookingBody({ petParentId, serviceId, dogIds, startsOn, endsOn }),
    );
    setSubmitting(false);
    if (!res.ok) {
      const { summary, fields } = formatApiErrors(res.data);
      const fieldText = Object.values(fields).filter(Boolean).join(' ');
      setFormSummary(summary || fieldText || 'Could not create that stay.');
      return;
    }
    setPetParentId('');
    setServiceId('');
    setDogIds([]);
    setStartsOn('');
    setEndsOn('');
    await load();
  };

  const parentName = id => lookupName(parents, id, householdLabel) || `Household ${id}`;
  const serviceName = id => lookupName(services, id, service => service.name) || `Service ${id}`;
  const dogNames = ids =>
    (Array.isArray(ids) ? ids : [])
      .map(id => lookupName(dogs, id, dog => dog.name) || `Dog ${id}`)
      .join(', ');

  return (
    <Box component="section" aria-labelledby="staff-bookings-heading">
      <Typography id="staff-bookings-heading" component="h2" variant="h5" sx={{ fontWeight: 600 }}>
        Bookings
      </Typography>

      {loadError ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {loadError}
        </Alert>
      ) : null}
      {rowError ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {rowError}
        </Alert>
      ) : null}
      {loading ? (
        <Typography sx={{ mt: 2, color: 'text.secondary' }}>Loading bookings…</Typography>
      ) : null}
      {!loading && !loadError && bookings.length === 0 ? (
        <Typography sx={{ mt: 2, color: 'text.secondary' }}>No stays yet.</Typography>
      ) : null}

      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {bookings.map(booking => (
          <Box
            key={booking.id}
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
            }}
          >
            <Typography>
              {parentName(booking.pet_parent_id)} · {serviceName(booking.service_id)} ·{' '}
              {dogNames(booking.dogs) || 'No dogs'} · {booking.starts_on} – {booking.ends_on} ·{' '}
              {booking.status}
            </Typography>
            {booking.status === 'requested' ? (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  sx={PRIMARY_BUTTON_SX}
                  disabled={pendingId === booking.id}
                  onClick={() => setStatus(booking, 'confirmed')}
                >
                  Confirm
                </Button>
                <Button
                  variant="outlined"
                  sx={SECONDARY_BUTTON_SX}
                  disabled={pendingId === booking.id}
                  onClick={() => setStatus(booking, 'declined')}
                >
                  Decline
                </Button>
              </Box>
            ) : null}
          </Box>
        ))}
      </Box>

      <Typography component="h3" variant="h6" sx={{ mt: 4, fontWeight: 600 }}>
        New stay
      </Typography>
      <Box
        component="form"
        onSubmit={handleCreate}
        sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 480 }}
      >
        {formError ? <Alert severity="warning">{formError}</Alert> : null}
        {formSummary ? <Alert severity="error">{formSummary}</Alert> : null}
        <GlassFormField
          select
          label="Household"
          fullWidth
          value={petParentId}
          onChange={event => {
            setPetParentId(event.target.value);
            setDogIds([]);
          }}
        >
          <MenuItem value="">Choose a household</MenuItem>
          {parents.map(parent => (
            <MenuItem key={parent.id} value={String(parent.id)}>
              {householdLabel(parent)}
            </MenuItem>
          ))}
        </GlassFormField>
        {petParentId ? (
          <Box>
            {householdDogs.length === 0 ? (
              <Typography color="text.secondary">This household has no dogs yet.</Typography>
            ) : (
              householdDogs.map(dog => (
                <FormControlLabel
                  key={dog.id}
                  control={
                    <Checkbox
                      checked={dogIds.includes(dog.id)}
                      onChange={() => toggleDog(dog.id)}
                    />
                  }
                  label={dog.name}
                />
              ))
            )}
          </Box>
        ) : null}
        <GlassFormField
          select
          label="Service"
          fullWidth
          value={serviceId}
          onChange={event => setServiceId(event.target.value)}
        >
          <MenuItem value="">Choose a service</MenuItem>
          {services.map(service => (
            <MenuItem key={service.id} value={String(service.id)}>
              {service.name}
            </MenuItem>
          ))}
        </GlassFormField>
        <GlassFormField
          label="Start date"
          type="date"
          fullWidth
          value={startsOn}
          onChange={event => setStartsOn(event.target.value)}
          {...DATE_FIELD_PROPS}
        />
        <GlassFormField
          label="End date"
          type="date"
          fullWidth
          value={endsOn}
          onChange={event => setEndsOn(event.target.value)}
          {...DATE_FIELD_PROPS}
        />
        <Button type="submit" variant="contained" disabled={submitting} sx={PRIMARY_BUTTON_SX}>
          {submitting ? 'Saving…' : 'Create stay'}
        </Button>
      </Box>
    </Box>
  );
}
