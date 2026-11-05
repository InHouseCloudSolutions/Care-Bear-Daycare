'use client';

import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Box, Button, ButtonBase, Chip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import { staffPath } from '@/consts/routes';
import { WEBSITE_ACCENT } from '@/consts/website-theme';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState, RecordCard, StatusChip, stackSx } from './DeskParts';
import StaffPageShell from './StaffPageShell';
import { cardSx, hairline, neutralPillSx } from './site-image-styles';
import {
  WEEKDAYS,
  calendarViewFromQuery,
  monthGrid,
  periodLabel,
  shiftAnchor,
  staySummary,
  staysCoveringDay,
  weekDays,
} from './staff-calendar';
import { formatDateRange, staffDeskRedirectPath, todayIso } from './staff-desk';
import useStaffDeskData from './useStaffDeskData';

const VIEWS = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

const listShape = {
  bookings: PropTypes.arrayOf(PropTypes.object).isRequired,
  dogs: PropTypes.arrayOf(PropTypes.object).isRequired,
  parents: PropTypes.arrayOf(PropTypes.object).isRequired,
  services: PropTypes.arrayOf(PropTypes.object).isRequired,
};

function writeCalendarView(mode) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (mode === 'month') url.searchParams.delete('view');
  else url.searchParams.set('view', mode);
  window.history.replaceState(window.history.state, '', url);
}

function DayView({ anchor, data, loading }) {
  const stays = staysCoveringDay(data.bookings, todayIso(anchor));
  if (loading) return null;
  if (stays.length === 0) return <EmptyState title="No stays this day." />;
  return (
    <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, mt: 2, ...stackSx(1.5) }}>
      {stays.map(booking => {
        const summary = staySummary(booking, data);
        return (
          <RecordCard
            component="li"
            key={booking.id}
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              columnGap: 2,
              rowGap: 1,
            }}
          >
            <Box sx={{ minWidth: 0, flex: '1 1 220px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography sx={{ fontWeight: 700 }}>{summary.dogs}</Typography>
                <StatusChip status={booking.status} />
              </Box>
              <Typography sx={{ mt: 0.5, color: 'text.secondary', fontSize: 14 }}>
                {summary.household}
                {summary.service ? ` · ${summary.service}` : ''}
              </Typography>
            </Box>
            <Typography sx={{ fontWeight: 600, fontSize: 15 }}>
              {formatDateRange(booking.starts_on, booking.ends_on)}
            </Typography>
          </RecordCard>
        );
      })}
    </Box>
  );
}

DayView.propTypes = {
  anchor: PropTypes.instanceOf(Date).isRequired,
  data: PropTypes.shape(listShape).isRequired,
  loading: PropTypes.bool.isRequired,
};

function WeekView({ anchor, data }) {
  const today = todayIso(new Date());
  return (
    <Box
      sx={{
        mt: 2,
        display: 'grid',
        gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
        gap: { xs: 0.5, md: 1 },
      }}
    >
      {weekDays(anchor).map(day => {
        const iso = todayIso(day);
        const todayColumn = iso === today;
        const stays = staysCoveringDay(data.bookings, iso);
        return (
          <Box
            key={iso}
            sx={theme => ({
              ...cardSx(theme),
              minHeight: 148,
              p: 1,
              borderColor: todayColumn ? WEBSITE_ACCENT : hairline(theme, 0.1),
              bgcolor: todayColumn ? alpha(WEBSITE_ACCENT, 0.16) : 'background.paper',
            })}
          >
            <Typography
              sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary', lineHeight: 1.2 }}
            >
              {WEEKDAYS[day.getDay()]}
            </Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>
              {day.getDate()}
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {stays.map(booking => (
                <Typography key={booking.id} noWrap sx={{ fontSize: 12, fontWeight: 600 }}>
                  {staySummary(booking, data).dogs}
                </Typography>
              ))}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

WeekView.propTypes = {
  anchor: PropTypes.instanceOf(Date).isRequired,
  data: PropTypes.shape(listShape).isRequired,
};

function MonthView({ anchor, data, onOpenDay }) {
  const today = todayIso(new Date());
  const month = anchor.getMonth();
  return (
    <Box
      sx={{
        mt: 2,
        display: 'grid',
        gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
        gap: { xs: 0.5, md: 0.75 },
      }}
    >
      {WEEKDAYS.map(label => (
        <Typography
          key={label}
          sx={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'text.secondary' }}
        >
          {label}
        </Typography>
      ))}
      {monthGrid(anchor).map(day => {
        const iso = todayIso(day);
        const inMonth = day.getMonth() === month;
        const isToday = iso === today;
        const stays = staysCoveringDay(data.bookings, iso);
        const names = stays.map(booking => staySummary(booking, data).dogs);
        const shown = names.slice(0, 3);
        const extra = names.length - shown.length;
        return (
          <ButtonBase
            key={iso}
            onClick={() => onOpenDay(day)}
            aria-label={formatDateRange(iso, iso)}
            sx={theme => ({
              ...cardSx(theme),
              minHeight: 108,
              p: 0.75,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              justifyContent: 'flex-start',
              textAlign: 'left',
              opacity: inMonth ? 1 : 0.45,
              borderColor: isToday ? WEBSITE_ACCENT : hairline(theme, 0.1),
              bgcolor: isToday ? alpha(WEBSITE_ACCENT, 0.16) : 'background.paper',
              '&:hover': { borderColor: WEBSITE_ACCENT },
              '&.Mui-focusVisible': { outline: `2px solid ${WEBSITE_ACCENT}`, outlineOffset: 2 },
            })}
          >
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                lineHeight: 1.2,
                color: inMonth ? 'text.primary' : 'text.disabled',
              }}
            >
              {day.getDate()}
            </Typography>
            {shown.map((label, index) => (
              <Typography
                key={`${iso}-${stays[index].id}`}
                noWrap
                sx={{ fontSize: 12, fontWeight: 600, lineHeight: 1.35 }}
              >
                {label}
              </Typography>
            ))}
            {extra > 0 ? (
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary' }}>
                +{extra} more
              </Typography>
            ) : null}
          </ButtonBase>
        );
      })}
    </Box>
  );
}

MonthView.propTypes = {
  anchor: PropTypes.instanceOf(Date).isRequired,
  data: PropTypes.shape(listShape).isRequired,
  onOpenDay: PropTypes.func.isRequired,
};

function CalendarBoard({ mode, anchor, data, loading, onOpenDay }) {
  switch (mode) {
    case 'day':
      return <DayView anchor={anchor} data={data} loading={loading} />;
    case 'week':
      return <WeekView anchor={anchor} data={data} />;
    case 'month':
      return <MonthView anchor={anchor} data={data} onOpenDay={onOpenDay} />;
    default: {
      const unexpected = mode;
      throw new Error(`Unexpected calendar mode: ${unexpected}`);
    }
  }
}

CalendarBoard.propTypes = {
  mode: PropTypes.oneOf(['day', 'week', 'month']).isRequired,
  anchor: PropTypes.instanceOf(Date).isRequired,
  data: PropTypes.shape(listShape).isRequired,
  loading: PropTypes.bool.isRequired,
  onOpenDay: PropTypes.func.isRequired,
};

export default function StaffCalendarPage() {
  const { user } = useAuth();
  const router = useRouter();
  const redirectPath = staffDeskRedirectPath(user);
  const data = useStaffDeskData();
  const [mode, setMode] = useState('month');
  const [anchor, setAnchor] = useState(() => new Date());

  useEffect(() => {
    if (redirectPath) router.replace(redirectPath);
  }, [redirectPath, router]);

  useEffect(() => {
    setMode(calendarViewFromQuery(window.location.search));
  }, []);

  const selectMode = useCallback(value => {
    setMode(value);
    writeCalendarView(value);
  }, []);

  const openDay = useCallback(
    day => {
      setAnchor(new Date(day.getFullYear(), day.getMonth(), day.getDate()));
      selectMode('day');
    },
    [selectMode],
  );

  if (!user || redirectPath) return null;

  return (
    <StaffPageShell
      crumbs={[{ label: 'Staff desk', href: staffPath() }, { label: 'Calendar' }]}
      title="Calendar"
      subtitle="See stays by day, week, and month."
    >
      {data.loadError ? (
        <Alert
          severity="error"
          sx={{ mt: 2.5 }}
          action={
            <Button color="inherit" size="small" onClick={data.reload}>
              Try again
            </Button>
          }
        >
          {data.loadError}
        </Alert>
      ) : null}

      <Box
        sx={{
          mt: 3,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Box role="group" aria-label="Calendar view" sx={{ display: 'flex', gap: 1 }}>
          {VIEWS.map(item => {
            const selected = mode === item.value;
            return (
              <Chip
                key={item.value}
                label={item.label}
                onClick={() => selectMode(item.value)}
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
        <Box role="group" aria-label="Choose dates" sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setAnchor(current => shiftAnchor(current, mode, -1))}
            sx={neutralPillSx}
          >
            Previous
          </Button>
          <Button variant="outlined" onClick={() => setAnchor(new Date())} sx={neutralPillSx}>
            Today
          </Button>
          <Button
            variant="outlined"
            onClick={() => setAnchor(current => shiftAnchor(current, mode, 1))}
            sx={neutralPillSx}
          >
            Next
          </Button>
        </Box>
      </Box>

      <Typography sx={{ mt: 2.5, fontWeight: 700, fontSize: 22, letterSpacing: '0.02em' }}>
        {periodLabel(anchor, mode)}
      </Typography>

      <CalendarBoard
        mode={mode}
        anchor={anchor}
        data={data}
        loading={data.loading}
        onOpenDay={openDay}
      />
    </StaffPageShell>
  );
}
