'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import GlassFormField from '@/components/design-studio/GlassFormField';
import DogHotelInteriorPage from '@/components/dog-hotel/DogHotelInteriorPage';
import { useAuth } from '@/contexts/AuthContext';
import { ACCOUNT_PATH } from '@/consts/routes';
import { WEBSITE_INK, WEBSITE_PAGE_BACKGROUND } from '@/consts/website-theme';
import {
  createBooking,
  formatApiErrors,
  getAvailability,
  listDogs,
  listPetParents,
  listServices,
} from '@/lib/daycareApi';
import {
  availabilityFailureMessage,
  dayStateCaption,
  dayStatePhrase,
  bookingDogs,
  dogsForHousehold,
  eachIsoDate,
  formatIsoDate,
  isPastIsoDate,
  isVisitKind,
  monthBounds,
  monthsBetween,
  parseIsoDate,
  petParentIds,
  rangeBlockMessage,
  showHouseholdPicker,
} from './booking-dates';
import { PRIMARY_BUTTON_SX, SECTION_HEADING_SX } from './pet-parent-styles';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const BOOKABLE_KINDS = new Set(['daycare', 'boarding', 'walk', 'drop_in']);

function householdLabel(parent) {
  const name = [parent.first_name, parent.last_name].filter(Boolean).join(' ');
  return name || parent.email || `Household ${parent.id}`;
}

function calendarHelp(kind) {
  const states =
    'Open and joinable days can be selected. Already booked days are taken. Closed days mean the daycare is closed.';
  if (isVisitKind(kind)) {
    return `${states} A walk or drop-in is one day, so another day is a separate request.`;
  }
  return `${states} Monday and Wednesday are two requests.`;
}

function isSelectable(info) {
  return Boolean(info && (info.state === 'open' || info.state === 'joinable'));
}

function prettyDate(iso) {
  return parseIsoDate(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function rangeSummary(kind, start, end) {
  if (kind === 'boarding') {
    return `Check-in ${prettyDate(start)}. Checkout ${prettyDate(end)}.`;
  }
  if (isVisitKind(kind) || start === end) return prettyDate(start);
  return `${prettyDate(start)} to ${prettyDate(end)}.`;
}

function mergeDays(dayMap, days) {
  const next = { ...dayMap };
  days.forEach(day => {
    next[day.date] = { state: day.state, reason: day.reason ?? null };
  });
  return next;
}

function MonthGrid({ visible, dayMap, range, kind, onPick }) {
  const year = visible.getFullYear();
  const month = visible.getMonth();
  const today = new Date();
  const lead = new Date(year, month, 1).getDay();
  const dayCount = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let index = 0; index < lead; index += 1) cells.push(null);
  for (let day = 1; day <= dayCount; day += 1) cells.push(day);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
        gap: 0.75,
        maxWidth: 520,
      }}
    >
      {WEEKDAYS.map(label => (
        <Typography
          key={label}
          component="span"
          sx={{
            textAlign: 'center',
            fontSize: 12,
            fontWeight: 600,
            color: alpha(WEBSITE_INK, 0.55),
          }}
        >
          {label}
        </Typography>
      ))}
      {cells.map((day, index) => {
        if (!day) return <Box key={`empty-${index}`} />;
        const iso = formatIsoDate(new Date(year, month, day));
        const info = dayMap[iso];
        const past = isPastIsoDate(iso, today);
        const selectable = !past && isSelectable(info);
        const inRange = Boolean(range.end && iso >= range.start && iso <= range.end);
        const isStart = iso === range.start;
        const selected = inRange || (isStart && !range.end);
        const isCheckout = kind === 'boarding' && range.end === iso;
        const phrase = dayStatePhrase(info?.state);
        const caption = isCheckout ? 'Checkout' : dayStateCaption(info?.state);
        const ariaParts = [isCheckout ? `Checkout ${prettyDate(iso)}` : prettyDate(iso)];
        if (past) ariaParts.push('past');
        ariaParts.push(phrase);
        const ariaLabel = ariaParts.join(', ');
        let bgcolor = 'transparent';
        if (selected) bgcolor = WEBSITE_INK;
        else if (info?.state === 'closed') bgcolor = alpha(WEBSITE_INK, 0.08);

        return (
          <Box
            key={iso}
            component="button"
            type="button"
            disabled={!selectable}
            onClick={() => onPick(iso)}
            aria-pressed={selected}
            aria-label={ariaLabel}
            sx={{
              minHeight: 48,
              borderRadius: 1,
              border: `1px solid ${alpha(WEBSITE_INK, info?.state === 'joinable' ? 0.55 : 0.18)}`,
              bgcolor,
              color: selected ? WEBSITE_PAGE_BACKGROUND : WEBSITE_INK,
              font: 'inherit',
              fontSize: 14,
              lineHeight: 1.1,
              cursor: selectable ? 'pointer' : 'not-allowed',
              opacity: selectable ? 1 : 0.38,
              textDecoration: info?.state === 'unavailable' ? 'line-through' : 'none',
            }}
          >
            {day}
            {caption ? (
              <Box component="span" sx={{ display: 'block', fontSize: 9, letterSpacing: '0.02em' }}>
                {caption}
              </Box>
            ) : null}
          </Box>
        );
      })}
    </Box>
  );
}

MonthGrid.propTypes = {
  visible: PropTypes.instanceOf(Date).isRequired,
  dayMap: PropTypes.objectOf(
    PropTypes.shape({
      state: PropTypes.string,
      reason: PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf([null])]),
    }),
  ).isRequired,
  range: PropTypes.shape({
    start: PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf([null])]),
    end: PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf([null])]),
  }).isRequired,
  kind: PropTypes.string,
  onPick: PropTypes.func.isRequired,
};

export default function BookStayPage() {
  const { token, user, petParent } = useAuth();
  const isStaff = Boolean(user?.isStaff);
  const availabilityGen = useRef(0);
  const [dogs, setDogs] = useState([]);
  const [householdId, setHouseholdId] = useState('');
  const [households, setHouseholds] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [serviceId, setServiceId] = useState('');
  const [visible, setVisible] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [availability, setAvailability] = useState({ key: '', days: {} });
  const [range, setRange] = useState({ start: null, end: null });
  const [rangeError, setRangeError] = useState(null);
  const [note, setNote] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [monthLoading, setMonthLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [monthError, setMonthError] = useState(null);
  const [summaryError, setSummaryError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const householdNumber = householdId === '' ? null : Number(householdId);
  const visibleDogs = isStaff ? dogsForHousehold(dogs, householdNumber) : dogs;
  const showHouseholds = showHouseholdPicker(isStaff, dogs);
  const selectedService =
    services.find(service => String(service.id) === String(serviceId)) || null;
  const selectionKey = `${serviceId}|${selectedIds.map(String).sort().join(',')}`;
  const dayMap = availability.key === selectionKey ? availability.days : {};

  useEffect(() => {
    if (!token) return undefined;
    let active = true;
    setPageLoading(true);
    Promise.all([listDogs(token), listServices(token)])
      .then(([dogsRes, servicesRes]) => {
        if (!active) return;
        setPageLoading(false);
        if (!dogsRes.ok) {
          setLoadError('Could not load your dogs.');
          return;
        }
        const dogList = Array.isArray(dogsRes.data) ? dogsRes.data : [];
        const parentIds = petParentIds(dogList);
        const staffView = Boolean(user?.isStaff);
        const scopedDogs = bookingDogs(dogList, {
          isStaff: staffView,
          petParentId: petParent?.id,
        });
        const ownId =
          petParentIds(scopedDogs)[0] ?? (staffView ? parentIds[0] : petParent?.id) ?? null;
        setDogs(scopedDogs);
        setHouseholdId(ownId == null ? '' : String(ownId));
        setHouseholds(staffView ? parentIds.map(id => ({ id, label: `Household ${id}` })) : []);
        setSelectedIds(
          scopedDogs
            .filter(dog => ownId == null || dog.pet_parent_id === ownId)
            .map(dog => dog.id),
        );
        if (staffView && parentIds.length > 1) {
          listPetParents(token).then(parentsRes => {
            if (!active || !parentsRes.ok || !Array.isArray(parentsRes.data)) return;
            const named = parentsRes.data
              .filter(parent => parentIds.includes(parent.id))
              .map(parent => ({ id: parent.id, label: householdLabel(parent) }));
            if (named.length) setHouseholds(named);
          });
        }
        if (!servicesRes.ok) {
          setLoadError('Could not load services.');
          return;
        }
        const bookable = (Array.isArray(servicesRes.data) ? servicesRes.data : []).filter(service =>
          BOOKABLE_KINDS.has(service.kind),
        );
        setServices(bookable);
      })
      .catch(() => {
        if (!active) return;
        setPageLoading(false);
        setLoadError('Could not load your dogs.');
      });
    return () => {
      active = false;
    };
  }, [token, user?.isStaff, petParent?.id]);

  useEffect(() => {
    availabilityGen.current += 1;
    setRange({ start: null, end: null });
    setRangeError(null);
  }, [selectionKey]);

  useEffect(() => {
    if (!token || !serviceId || selectedIds.length === 0) return undefined;
    const gen = availabilityGen.current;
    const { from, to } = monthBounds(visible.getFullYear(), visible.getMonth());
    let active = true;
    setMonthLoading(true);
    setMonthError(null);
    getAvailability(token, { serviceId, dogIds: selectedIds, from, to }).then(res => {
      if (!active || gen !== availabilityGen.current) return;
      setMonthLoading(false);
      if (!res.ok || !Array.isArray(res.data?.days)) {
        setMonthError(availabilityFailureMessage(res.data));
        return;
      }
      setAvailability(current => ({
        key: selectionKey,
        days: mergeDays(current.key === selectionKey ? current.days : {}, res.data.days),
      }));
    });
    return () => {
      active = false;
    };
  }, [token, serviceId, selectedIds, selectionKey, visible]);

  const shiftMonth = delta => {
    setVisible(current => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  };

  const loadDayMap = async (start, end) => {
    const needed = eachIsoDate(start, end);
    if (needed.every(date => dayMap[date])) return dayMap;
    const gen = availabilityGen.current;
    const results = await Promise.all(
      monthsBetween(start, end).map(({ year, month }) => {
        const bounds = monthBounds(year, month);
        return getAvailability(token, {
          serviceId,
          dogIds: selectedIds,
          from: bounds.from,
          to: bounds.to,
        });
      }),
    );
    if (gen !== availabilityGen.current) return null;
    if (results.some(res => !res.ok || !Array.isArray(res.data?.days))) return null;
    const merged = results.reduce((map, res) => mergeDays(map, res.data.days), { ...dayMap });
    setAvailability({ key: selectionKey, days: merged });
    return merged;
  };

  const handlePick = async iso => {
    if (!selectedService || isPastIsoDate(iso) || !isSelectable(dayMap[iso])) return;
    if (isVisitKind(selectedService.kind)) {
      setRangeError(null);
      setRange({ start: iso, end: iso });
      return;
    }
    if (!range.start || range.end) {
      setRangeError(null);
      setRange({ start: iso, end: null });
      return;
    }

    let { start } = range;
    let end = iso;
    if (end < start) {
      const earlier = end;
      end = start;
      start = earlier;
    }

    const gen = availabilityGen.current;
    const loadedDays = await loadDayMap(start, end);
    if (gen !== availabilityGen.current) return;
    if (!loadedDays) {
      setRange({ start: null, end: null });
      setRangeError('Could not check those dates. Pick another range or date.');
      return;
    }
    const message = rangeBlockMessage(start, end, loadedDays, selectedService.kind);
    if (message) {
      setRange({ start: null, end: null });
      setRangeError(message);
      return;
    }
    setRangeError(null);
    setRange({ start, end });
  };

  const handleHousehold = event => {
    const nextId = Number(event.target.value);
    setHouseholdId(String(nextId));
    setSelectedIds(dogs.filter(dog => dog.pet_parent_id === nextId).map(dog => dog.id));
  };

  const handleDogToggle = dogId => event => {
    setSelectedIds(current =>
      event.target.checked ? [...current, dogId] : current.filter(id => id !== dogId),
    );
  };

  const handleSubmit = async event => {
    event.preventDefault();
    if (!range.start || !range.end || !serviceId || selectedIds.length === 0) return;
    setSubmitting(true);
    setSummaryError(null);
    setFieldErrors({});
    const body = {
      service_id: Number(serviceId),
      dogs: selectedIds,
      starts_on: range.start,
      ends_on: range.end,
      parent_note: note,
    };
    if (user?.isStaff && householdNumber != null) {
      body.pet_parent_id = householdNumber;
    }
    const res = await createBooking(token, body);
    setSubmitting(false);
    if (res.ok) {
      setSubmitted(true);
      return;
    }
    if (res.status === 0) {
      setSummaryError('Could not send your request. Check your connection and try again.');
      return;
    }
    const { summary, fields } = formatApiErrors(res.data);
    setFieldErrors(fields);
    setSummaryError(
      summary || (Object.keys(fields).length ? null : 'Could not send your request.'),
    );
  };

  if (submitted) {
    return (
      <DogHotelInteriorPage title="Book a stay">
        <Alert severity="success" sx={{ mt: 3, maxWidth: 560 }}>
          We received your request. It is not booked until staff confirms.
        </Alert>
        <Button
          component={Link}
          href={ACCOUNT_PATH}
          variant="contained"
          sx={{ ...PRIMARY_BUTTON_SX, mt: 3 }}
        >
          Back to your account
        </Button>
      </DogHotelInteriorPage>
    );
  }

  const otherFieldErrors = Object.entries(fieldErrors).filter(([field]) => field !== 'parent_note');
  const showCalendar = selectedIds.length > 0 && Boolean(serviceId);

  return (
    <DogHotelInteriorPage
      title="Book a stay"
      lede="Request a stay. Staff confirm it before it is booked."
    >
      {pageLoading ? <Typography sx={{ mt: 3 }}>Loading your dogs…</Typography> : null}
      {loadError ? (
        <Alert severity="error" sx={{ mt: 3, maxWidth: 560 }}>
          {loadError}
        </Alert>
      ) : null}
      {!pageLoading && !loadError && dogs.length === 0 ? (
        <Box sx={{ mt: 3, maxWidth: 560 }}>
          <Typography>
            Add a dog on your account page before you request a stay. This page does not create a
            dog profile.
          </Typography>
          <Button
            component={Link}
            href={ACCOUNT_PATH}
            variant="contained"
            sx={{ ...PRIMARY_BUTTON_SX, mt: 2 }}
          >
            Go to your account
          </Button>
        </Box>
      ) : null}

      {!pageLoading && !loadError && dogs.length > 0 ? (
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 3, maxWidth: 640 }}
        >
          {summaryError ? <Alert severity="error">{summaryError}</Alert> : null}
          {otherFieldErrors.map(([field, text]) => (
            <Alert key={field} severity="error">
              {text}
            </Alert>
          ))}

          {showHouseholds ? (
            <GlassFormField
              select
              label="Household"
              required
              fullWidth
              value={householdId}
              onChange={handleHousehold}
            >
              {households.map(household => (
                <MenuItem key={household.id} value={String(household.id)}>
                  {household.label}
                </MenuItem>
              ))}
            </GlassFormField>
          ) : null}

          <Box>
            <Typography component="h2" sx={SECTION_HEADING_SX}>
              Dogs
            </Typography>
            <Typography sx={{ mt: 1, color: alpha(WEBSITE_INK, 0.72) }}>
              Every dog is selected. Uncheck anyone who is staying home.
            </Typography>
            {visibleDogs.map(dog => (
              <FormControlLabel
                key={dog.id}
                sx={{ display: 'flex', alignItems: 'flex-start', mt: 1, ml: 0 }}
                control={
                  <Checkbox
                    checked={selectedIds.includes(dog.id)}
                    onChange={handleDogToggle(dog.id)}
                  />
                }
                label={
                  <Box sx={{ pt: 0.85 }}>
                    <Typography>{dog.name}</Typography>
                    <Typography sx={{ fontSize: 14, color: alpha(WEBSITE_INK, 0.65) }}>
                      {dog.good_with_dogs ? 'Good with other dogs' : 'Not good with other dogs'}
                    </Typography>
                  </Box>
                }
              />
            ))}
            {selectedIds.length === 0 ? (
              <Typography sx={{ mt: 1 }}>Choose at least one dog.</Typography>
            ) : null}
          </Box>

          {services.length === 0 ? (
            <Alert severity="info">No services are open for requests right now.</Alert>
          ) : (
            <GlassFormField
              select
              label="Service"
              required
              fullWidth
              value={serviceId}
              onChange={event => setServiceId(event.target.value)}
              error={Boolean(fieldErrors.service_id)}
              helperText={fieldErrors.service_id}
            >
              <MenuItem value="" disabled>
                Choose a service
              </MenuItem>
              {services.map(service => (
                <MenuItem key={service.id} value={String(service.id)}>
                  {service.name}
                </MenuItem>
              ))}
            </GlassFormField>
          )}

          {showCalendar ? (
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                  mb: 1.5,
                }}
              >
                <Button type="button" onClick={() => shiftMonth(-1)} sx={{ textTransform: 'none' }}>
                  Previous
                </Button>
                <Typography component="h2" sx={{ ...SECTION_HEADING_SX, textAlign: 'center' }}>
                  {visible.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Typography>
                <Button type="button" onClick={() => shiftMonth(1)} sx={{ textTransform: 'none' }}>
                  Next
                </Button>
              </Box>
              {monthLoading ? <Typography sx={{ mb: 1 }}>Loading availability…</Typography> : null}
              {monthError ? (
                <Alert severity="error" sx={{ mb: 1.5 }}>
                  {monthError}
                </Alert>
              ) : null}
              <MonthGrid
                visible={visible}
                dayMap={dayMap}
                range={range}
                kind={selectedService?.kind}
                onPick={handlePick}
              />
              <Typography sx={{ mt: 1.5, fontSize: 14, color: alpha(WEBSITE_INK, 0.7) }}>
                {calendarHelp(selectedService?.kind)}
              </Typography>
              {range.start && !range.end ? (
                <Typography sx={{ mt: 1 }}>
                  {selectedService?.kind === 'boarding'
                    ? `Check-in ${prettyDate(range.start)}. Choose a checkout date after that day.`
                    : `Start ${prettyDate(range.start)}. Choose an end date. The same day is fine.`}
                </Typography>
              ) : null}
              {range.start && range.end ? (
                <Typography sx={{ mt: 1 }}>
                  {rangeSummary(selectedService?.kind, range.start, range.end)}
                </Typography>
              ) : null}
              {rangeError ? (
                <Alert severity="warning" sx={{ mt: 1.5 }}>
                  {rangeError}
                </Alert>
              ) : null}
            </Box>
          ) : null}

          <GlassFormField
            label="Note for staff"
            fullWidth
            multiline
            minRows={3}
            value={note}
            onChange={event => setNote(event.target.value)}
            error={Boolean(fieldErrors.parent_note)}
            helperText={fieldErrors.parent_note}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={submitting || !range.start || !range.end || selectedIds.length === 0}
            sx={PRIMARY_BUTTON_SX}
          >
            {submitting ? 'Sending…' : 'Request this stay'}
          </Button>
        </Box>
      ) : null}
    </DogHotelInteriorPage>
  );
}
