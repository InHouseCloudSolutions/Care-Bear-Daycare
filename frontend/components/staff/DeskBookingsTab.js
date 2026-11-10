'use client';

import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Box, Chip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PetsRoundedIcon from '@mui/icons-material/PetsRounded';
import { WEBSITE_ACCENT, WEBSITE_INK } from '@/consts/website-theme';
import {
  addBookingExtra,
  createBooking,
  deleteBookingExtra,
  formatApiErrors,
  updateBooking,
} from '@/lib/daycareApi';
import {
  ConfirmDialog,
  DeskSectionHeader,
  EmptyState,
  NewButton,
  RecordCard,
  RowButton,
  SkeletonRows,
  StatusChip,
  stackSx,
} from './DeskParts';
import { AddBookingExtraDialog, EditStayDialog, StayDialog, TimestampDialog } from './DeskDialogs';
import StayCarePanel from './StayCarePanel';
import StayDocumentsMenu from './StayDocumentsMenu';
import {
  BOOKING_FILTERS,
  bookingActions,
  bookingExtraLineLabel,
  bookingMatchesFilter,
  bookingStatusPatch,
  dogsOnBooking,
  formatDateRange,
  formatTimestamp,
  formatWindow,
  householdLabel,
  moneyLabel,
  sortBookings,
} from './staff-desk';
import { hairline } from './site-image-styles';

function nameLookup(rows, label) {
  const map = new Map(rows.map(row => [row.id, label(row)]));
  return id => map.get(id);
}

function formatStayDate(value) {
  return formatDateRange(value, value);
}

function perUnitLabel(service) {
  if (service?.rate_unit === 'day') return 'Per day';
  if (service?.rate_unit === 'visit') return 'Per visit';
  return 'Per night';
}

function StayFact({ icon, label, value, hint }) {
  return (
    <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start', minWidth: 0 }}>
      <Box sx={{ color: 'text.secondary', mt: 0.25, '& svg': { fontSize: 18 } }} aria-hidden>
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.3 }}>
          {label}
        </Typography>
        <Typography sx={{ mt: 0.25, fontWeight: 600, fontSize: 15, lineHeight: 1.35 }}>
          {value}
        </Typography>
        {hint ? (
          <Typography sx={{ mt: 0.15, fontSize: 12.5, color: 'text.secondary' }}>{hint}</Typography>
        ) : null}
      </Box>
    </Box>
  );
}

StayFact.propTypes = {
  icon: PropTypes.element.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  hint: PropTypes.string,
};

function StayCard({
  booking,
  household,
  dogNames,
  service,
  serviceRecord,
  dogs,
  parent,
  services,
  pending,
  onAction,
  token,
  extrasCatalog,
  reload,
  notify,
}) {
  const actions = bookingActions(booking.status);
  const note = String(booking.parent_note || '').trim();
  const checkIn = formatStayDate(booking.starts_on);
  const checkOut = formatStayDate(booking.ends_on);
  const [timestampOpen, setTimestampOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addExtraOpen, setAddExtraOpen] = useState(false);
  const [removingLine, setRemovingLine] = useState(null);
  const [lineBusy, setLineBusy] = useState(false);
  const [lineError, setLineError] = useState(null);
  const [previewError, setPreviewError] = useState(null);

  const inWindow =
    formatWindow(booking.est_checkin_start, booking.est_checkin_end) ||
    formatWindow(serviceRecord?.check_in_from, serviceRecord?.check_in_until);
  const outWindow =
    formatWindow(booking.est_checkout_start, booking.est_checkout_end) ||
    formatWindow(serviceRecord?.check_out_from, serviceRecord?.check_out_until);
  const hasActualTimes = Boolean(booking.checked_in_at) || Boolean(booking.checked_out_at);
  const canCorrectTimes = booking.status === 'checked_in' || booking.status === 'completed';
  const canManageExtras = booking.status !== 'declined' && booking.status !== 'cancelled';
  const extraItems = (extrasCatalog || []).filter(item => item.kind === 'item' && item.active);
  const extraLines = booking.extras || [];

  const confirmRemoveLine = async () => {
    setLineBusy(true);
    setLineError(null);
    const res = await deleteBookingExtra(token, booking.id, removingLine.id);
    setLineBusy(false);
    if (!res.ok && res.status !== 204) {
      setLineError(formatApiErrors(res.data).summary || 'Could not remove that extra.');
      return;
    }
    const { description } = removingLine;
    setRemovingLine(null);
    await reload();
    notify(`${description} removed.`);
  };

  return (
    <RecordCard
      component="li"
      highlight={booking.status === 'requested'}
      aria-label={`${household}, check-in ${checkIn}, checkout ${checkOut}`}
      sx={{ display: 'block' }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography sx={{ fontWeight: 700, fontSize: 18, lineHeight: 1.3 }}>
              {household}
            </Typography>
            <StatusChip status={booking.status} />
          </Box>
          <Typography
            sx={{
              mt: 0.75,
              color: 'text.secondary',
              fontSize: 14.5,
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
            }}
          >
            <PetsRoundedIcon sx={{ fontSize: 16, color: WEBSITE_ACCENT }} aria-hidden />
            {dogNames.length ? dogNames.join(', ') : 'No dogs'}
          </Typography>
        </Box>
        <StayDocumentsMenu
          household={household}
          bookingId={booking.id}
          token={token}
          disabled={pending}
          actions={actions}
          onAction={action => onAction(booking, action)}
          onEdit={() => setEditOpen(true)}
          onError={setPreviewError}
          onNotify={notify}
        />
      </Box>

      <Box
        sx={theme => ({
          mt: 2,
          pt: 2,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
          rowGap: 2,
          borderTop: '1px solid',
          borderColor: hairline(theme, 0.12),
          '& > * + *': {
            borderTop: { xs: '1px solid', md: 'none' },
            borderLeft: { md: '1px solid' },
            borderColor: hairline(theme, 0.12),
            pt: { xs: 2, md: 0 },
            pl: { md: 2.5 },
          },
        })}
      >
        <StayFact
          icon={<CalendarTodayOutlinedIcon />}
          label="Check-in"
          value={checkIn}
          hint={inWindow ? `Expected ${inWindow}` : null}
        />
        <StayFact
          icon={<CalendarTodayOutlinedIcon />}
          label="Checkout"
          value={checkOut}
          hint={outWindow ? `Expected ${outWindow}` : null}
        />
        <StayFact icon={<HomeOutlinedIcon />} label="Service" value={service} />
      </Box>

      {previewError ? (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setPreviewError(null)}>
          {previewError}
        </Alert>
      ) : null}

      {hasActualTimes ? (
        <Box
          sx={{
            mt: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
          }}
        >
          <Typography sx={{ fontSize: 13.5, color: 'text.secondary' }}>
            {booking.checked_in_at ? `Checked in ${formatTimestamp(booking.checked_in_at)}` : null}
            {booking.checked_in_at && booking.checked_out_at ? ' · ' : ''}
            {booking.checked_out_at
              ? `Checked out ${formatTimestamp(booking.checked_out_at)}`
              : null}
          </Typography>
          {canCorrectTimes ? (
            <RowButton onClick={() => setTimestampOpen(true)}>Correct times</RowButton>
          ) : null}
        </Box>
      ) : null}

      <Box
        sx={theme => ({
          mt: 2,
          pt: 2,
          borderTop: '1px solid',
          borderColor: hairline(theme, 0.12),
        })}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Typography sx={{ fontSize: 13.5, color: 'text.secondary' }}>
            {perUnitLabel(serviceRecord)} {moneyLabel(booking.charge)}
          </Typography>
          <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
            Total {moneyLabel(booking.total)}
          </Typography>
        </Box>

        {extraLines.length > 0 ? (
          <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, mt: 1, ...stackSx(0.5) }}>
            {extraLines.map(line => (
              <Box
                key={line.id}
                component="li"
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Typography sx={{ fontSize: 14 }}>{bookingExtraLineLabel(line)}</Typography>
                {line.kind === 'item' && canManageExtras ? (
                  <RowButton
                    onClick={() => {
                      setLineError(null);
                      setRemovingLine(line);
                    }}
                    aria-label={`Remove ${line.description}`}
                  >
                    Remove
                  </RowButton>
                ) : null}
              </Box>
            ))}
          </Box>
        ) : null}

        {canManageExtras ? (
          <Box sx={{ mt: 1.5 }}>
            <RowButton onClick={() => setAddExtraOpen(true)}>Add item</RowButton>
          </Box>
        ) : null}
      </Box>

      {note ? (
        <Box
          sx={theme => ({
            mt: 2,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1,
            px: 1.5,
            py: 1,
            borderRadius: '10px',
            border: '1px solid',
            borderColor: hairline(theme, 0.14),
            color: 'text.secondary',
          })}
        >
          <InfoOutlinedIcon sx={{ fontSize: 18, mt: 0.15 }} aria-hidden />
          <Typography sx={{ fontSize: 14, fontStyle: 'italic', color: 'text.secondary' }}>
            {note}
          </Typography>
        </Box>
      ) : null}

      <StayCarePanel
        bookingId={booking.id}
        status={booking.status}
        dogs={dogsOnBooking(booking, dogs)}
        parent={parent}
        token={token}
      />

      {editOpen ? (
        <EditStayDialog
          open
          booking={booking}
          householdName={household}
          dogs={dogs}
          services={services}
          onClose={() => setEditOpen(false)}
          onSave={body => updateBooking(token, booking.id, body)}
          onSaved={async () => {
            setEditOpen(false);
            await reload();
            notify('Stay updated.');
          }}
        />
      ) : null}
      <TimestampDialog
        open={timestampOpen}
        booking={booking}
        onClose={() => setTimestampOpen(false)}
        onSave={body => updateBooking(token, booking.id, body)}
        onSaved={async () => {
          setTimestampOpen(false);
          await reload();
          notify('Times updated.');
        }}
      />
      <AddBookingExtraDialog
        open={addExtraOpen}
        items={extraItems}
        onClose={() => setAddExtraOpen(false)}
        onSave={body => addBookingExtra(token, booking.id, body)}
        onSaved={async () => {
          setAddExtraOpen(false);
          await reload();
          notify('Extra added.');
        }}
      />
      <ConfirmDialog
        open={Boolean(removingLine)}
        title={`Remove ${removingLine?.description || 'this extra'}?`}
        body="This removes the charge from this stay."
        confirmLabel="Remove"
        busy={lineBusy}
        error={lineError}
        onClose={() => setRemovingLine(null)}
        onConfirm={confirmRemoveLine}
      />
    </RecordCard>
  );
}

StayCard.propTypes = {
  booking: PropTypes.object.isRequired,
  household: PropTypes.string.isRequired,
  dogNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  service: PropTypes.string.isRequired,
  serviceRecord: PropTypes.object,
  dogs: PropTypes.array,
  parent: PropTypes.object,
  services: PropTypes.array,
  pending: PropTypes.bool,
  onAction: PropTypes.func.isRequired,
  token: PropTypes.string,
  extrasCatalog: PropTypes.array,
  reload: PropTypes.func.isRequired,
  notify: PropTypes.func.isRequired,
};

export default function DeskBookingsTab({ data, notify }) {
  const { bookings, parents, dogs, services, extras, token, reload, loading } = data;
  const [filter, setFilter] = useState('active');
  const [pendingId, setPendingId] = useState(null);
  const [rowError, setRowError] = useState(null);
  const [creating, setCreating] = useState(false);

  const parentName = useMemo(() => nameLookup(parents, householdLabel), [parents]);
  const parentById = useMemo(() => new Map(parents.map(row => [row.id, row])), [parents]);
  const serviceName = useMemo(() => nameLookup(services, s => s.name), [services]);
  const dogName = useMemo(() => nameLookup(dogs, d => d.name), [dogs]);
  const serviceById = useMemo(() => new Map(services.map(s => [s.id, s])), [services]);

  const counts = useMemo(() => {
    const result = {};
    BOOKING_FILTERS.forEach(item => {
      result[item.value] = bookings.filter(b => bookingMatchesFilter(b, item.value)).length;
    });
    return result;
  }, [bookings]);

  const visible = useMemo(
    () => sortBookings(bookings.filter(booking => bookingMatchesFilter(booking, filter))),
    [bookings, filter],
  );
  const inCare = visible.filter(booking => booking.status === 'checked_in');
  const otherStays = visible.filter(booking => booking.status !== 'checked_in');

  const setStatus = async (booking, action) => {
    setRowError(null);
    setPendingId(booking.id);
    const res = await updateBooking(token, booking.id, bookingStatusPatch(action.status));
    setPendingId(null);
    if (!res.ok) {
      const { summary, fields } = formatApiErrors(res.data);
      setRowError(summary || Object.values(fields)[0] || 'Could not update that stay.');
      return;
    }
    await reload();
    notify(`${action.done} for ${parentName(booking.pet_parent_id) || 'this household'}.`);
  };

  const renderStay = booking => {
    const names = (booking.dogs || []).map(id => dogName(id) || `Dog ${id}`);
    const household = parentName(booking.pet_parent_id) || `Household ${booking.pet_parent_id}`;
    return (
      <StayCard
        key={booking.id}
        booking={booking}
        household={household}
        dogNames={names}
        service={serviceName(booking.service_id) || `Service ${booking.service_id}`}
        serviceRecord={serviceById.get(booking.service_id)}
        dogs={dogs}
        parent={parentById.get(booking.pet_parent_id) || null}
        services={services}
        pending={pendingId === booking.id}
        onAction={setStatus}
        token={token}
        extrasCatalog={extras}
        reload={reload}
        notify={notify}
      />
    );
  };

  return (
    <Box role="tabpanel" id="desk-bookings-panel" aria-labelledby="desk-bookings-tab">
      <DeskSectionHeader
        id="staff-bookings-heading"
        title="Bookings"
        description="Manage requests, arrivals, and pickups."
        action={
          <NewButton startIcon={<AddRoundedIcon />} onClick={() => setCreating(true)}>
            New stay
          </NewButton>
        }
      />

      <Box
        role="group"
        aria-label="Filter stays"
        sx={{ mt: 2.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}
      >
        {BOOKING_FILTERS.map(item => {
          const selected = filter === item.value;
          return (
            <Chip
              key={item.value}
              label={`${item.label} ${counts[item.value] ?? 0}`}
              onClick={() => setFilter(item.value)}
              aria-pressed={selected}
              sx={theme => ({
                height: 34,
                borderRadius: 999,
                fontWeight: 600,
                px: 0.5,
                border: '1px solid',
                borderColor: selected ? WEBSITE_ACCENT : hairline(theme, 0.2),
                bgcolor: selected ? alpha(WEBSITE_ACCENT, 0.18) : 'transparent',
                color: 'text.primary',
                '&:hover': { bgcolor: alpha(WEBSITE_ACCENT, 0.12) },
              })}
            />
          );
        })}
      </Box>

      {rowError ? (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setRowError(null)}>
          {rowError}
        </Alert>
      ) : null}

      {loading ? <SkeletonRows height={168} /> : null}

      {!loading && visible.length === 0 ? (
        <EmptyState
          icon={<EventAvailableOutlinedIcon />}
          title={bookings.length === 0 ? 'No stays yet' : 'Nothing here'}
          body={
            bookings.length === 0
              ? 'Requests from families and stays you create will show up here.'
              : 'No stays match this filter.'
          }
        />
      ) : null}

      {!loading && visible.length > 0 ? (
        <Box sx={{ mt: 2, ...stackSx(2) }}>
          {inCare.length > 0 ? (
            <Box>
              <Chip
                label="in care"
                size="small"
                sx={theme => ({
                  mb: 1.25,
                  height: 26,
                  borderRadius: 999,
                  fontWeight: 600,
                  fontSize: 13,
                  letterSpacing: '0.01em',
                  bgcolor:
                    theme.palette.mode === 'dark'
                      ? alpha('#7EA8A4', 0.16)
                      : alpha(WEBSITE_INK, 0.08),
                  color: theme.palette.mode === 'dark' ? '#C9E0DC' : WEBSITE_INK,
                  border: '1px solid',
                  borderColor: hairline(theme, theme.palette.mode === 'dark' ? 0.08 : 0.1),
                })}
              />
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, ...stackSx(1.5) }}>
                {inCare.map(renderStay)}
              </Box>
            </Box>
          ) : null}
          {otherStays.length > 0 ? (
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, ...stackSx(1.5) }}>
              {otherStays.map(renderStay)}
            </Box>
          ) : null}
        </Box>
      ) : null}

      <StayDialog
        open={creating}
        parents={parents}
        dogs={dogs}
        services={services}
        onClose={() => setCreating(false)}
        onSave={body => createBooking(token, body)}
        onSaved={async () => {
          setCreating(false);
          await reload();
          notify('Stay created and confirmed.');
        }}
      />
    </Box>
  );
}

DeskBookingsTab.propTypes = {
  data: PropTypes.object.isRequired,
  notify: PropTypes.func.isRequired,
};
