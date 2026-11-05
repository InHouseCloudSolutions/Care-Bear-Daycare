'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Box, Button, ButtonBase, Snackbar, Tab, Tabs, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import BeachAccessOutlinedIcon from '@mui/icons-material/BeachAccessOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import PetsRoundedIcon from '@mui/icons-material/PetsRounded';
import RoomServiceOutlinedIcon from '@mui/icons-material/RoomServiceOutlined';
import SlideshowOutlinedIcon from '@mui/icons-material/SlideshowOutlined';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { staffPath } from '@/consts/routes';
import { WEBSITE_ACCENT, WEBSITE_INK } from '@/consts/website-theme';
import { useAuth } from '@/contexts/AuthContext';
import DeskBookingsTab from './DeskBookingsTab';
import DeskExtrasTab from './DeskExtrasTab';
import DeskHolidaysTab from './DeskHolidaysTab';
import DeskHouseholdsTab from './DeskHouseholdsTab';
import DeskServicesTab from './DeskServicesTab';
import SiteImageSection from './SiteImageSection';
import StaffPageShell from './StaffPageShell';
import { cardSx, hairline, staffTabSx, staffTabsSx, utilityButtonSx } from './site-image-styles';
import { dogsInCareOn, formatDateRange, staffDeskRedirectPath, todayIso } from './staff-desk';
import useStaffDeskData from './useStaffDeskData';

const BUILT_IN_HOME =
  'The public home page still uses the built-in photos until the first image is saved.';
const BUILT_IN_GALLERY =
  'The public gallery still uses the built-in photos until the first image is saved.';

function HomeSlidesPanel() {
  return (
    <SiteImageSection
      placement="home_slide"
      title="Home page slides"
      headingId="staff-home-slides-heading"
      emptyMessage={BUILT_IN_HOME}
      panelId="desk-home_slide-panel"
      tabId="desk-home_slide-tab"
    />
  );
}

function GalleryPanel() {
  return (
    <SiteImageSection
      placement="gallery"
      title="Gallery"
      headingId="staff-gallery-heading"
      emptyMessage={BUILT_IN_GALLERY}
      panelId="desk-gallery-panel"
      tabId="desk-gallery-tab"
    />
  );
}

const TABS = [
  { value: 'bookings', label: 'Bookings', Icon: EventNoteOutlinedIcon, Panel: DeskBookingsTab },
  { value: 'households', label: 'Households', Icon: HomeOutlinedIcon, Panel: DeskHouseholdsTab },
  { value: 'holidays', label: 'Holidays', Icon: BeachAccessOutlinedIcon, Panel: DeskHolidaysTab },
  { value: 'services', label: 'Services', Icon: RoomServiceOutlinedIcon, Panel: DeskServicesTab },
  { value: 'extras', label: 'Extras', Icon: LocalOfferOutlinedIcon, Panel: DeskExtrasTab },
  {
    value: 'home_slide',
    label: 'Home page slides',
    Icon: SlideshowOutlinedIcon,
    Panel: HomeSlidesPanel,
  },
  { value: 'gallery', label: 'Gallery', Icon: CollectionsOutlinedIcon, Panel: GalleryPanel },
];

function tabFromUrl() {
  if (typeof window === 'undefined') return null;
  const value = new URLSearchParams(window.location.search).get('tab');
  return TABS.some(tab => tab.value === value) ? value : null;
}

function StatCard({ label, value, hint, Icon, onClick }) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={theme => ({
        ...cardSx(theme),
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 1.5,
        textAlign: 'left',
        transition: 'border-color 150ms',
        '&:hover': { borderColor: alpha(WEBSITE_ACCENT, 0.6) },
        '&.Mui-focusVisible': { outline: `2px solid ${WEBSITE_ACCENT}`, outlineOffset: 2 },
      })}
    >
      <Box
        aria-hidden
        sx={{
          width: 40,
          height: 40,
          borderRadius: '12px',
          display: { xs: 'none', sm: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          bgcolor: alpha(WEBSITE_ACCENT, 0.16),
          color: WEBSITE_ACCENT,
        }}
      >
        <Icon sx={{ fontSize: 20 }} />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          noWrap
          title={typeof value === 'string' ? value : undefined}
          sx={{ fontSize: typeof value === 'string' ? 18 : 22, fontWeight: 700, lineHeight: 1.2 }}
        >
          {value}
        </Typography>
        <Typography
          sx={{ fontSize: 13, color: 'text.secondary', fontWeight: 600, lineHeight: 1.3 }}
        >
          {label}
        </Typography>
        {hint ? (
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }} noWrap>
            {hint}
          </Typography>
        ) : null}
      </Box>
    </ButtonBase>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
  hint: PropTypes.string,
  Icon: PropTypes.elementType.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default function StaffDeskPage() {
  const { user } = useAuth();
  const router = useRouter();
  const redirectPath = staffDeskRedirectPath(user);
  const data = useStaffDeskData();
  const [tab, setTab] = useState('bookings');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (redirectPath) router.replace(redirectPath);
  }, [redirectPath, router]);

  useEffect(() => {
    const fromUrl = tabFromUrl();
    if (fromUrl) setTab(fromUrl);
  }, []);

  const selectTab = useCallback(value => {
    setTab(value);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (value === 'bookings') url.searchParams.delete('tab');
      else url.searchParams.set('tab', value);
      window.history.replaceState(window.history.state, '', url);
    }
  }, []);

  const notify = useCallback(message => setToast({ message, key: Date.now() }), []);

  const stats = useMemo(() => {
    const today = todayIso();
    const requests = data.bookings.filter(booking => booking.status === 'requested').length;
    const nextHoliday = [...data.closures]
      .filter(item => item.ends_on >= today)
      .sort((a, b) => a.starts_on.localeCompare(b.starts_on))[0];
    return {
      requests,
      inCare: dogsInCareOn(data.bookings, today),
      households: data.parents.length,
      dogs: data.dogs.length,
      nextHoliday,
    };
  }, [data.bookings, data.closures, data.parents, data.dogs]);

  if (!user || redirectPath) return null;

  const active = TABS.find(item => item.value === tab) || TABS[0];
  const { Panel } = active;
  const loadingValue = data.loading ? '–' : null;

  return (
    <StaffPageShell
      crumbs={[{ label: 'Staff desk' }]}
      title="Staff desk"
      subtitle={
        user.firstName
          ? `Hello, ${user.firstName}. Here’s what’s happening at Care Bear.`
          : 'Here’s what’s happening at Care Bear.'
      }
      actions={
        <Button
          component={NextLink}
          href={staffPath('calendar')}
          startIcon={<CalendarMonthOutlinedIcon sx={{ fontSize: 18 }} />}
          sx={utilityButtonSx}
        >
          Calendar
        </Button>
      }
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
          gap: 1.5,
          '& > *': { flex: { xs: '1 1 140px', sm: '1 1 200px' }, minWidth: 0 },
        }}
      >
        <StatCard
          label="Requests waiting"
          value={loadingValue ?? stats.requests}
          Icon={EventNoteOutlinedIcon}
          onClick={() => selectTab('bookings')}
        />
        <StatCard
          label="Dogs in care today"
          value={loadingValue ?? stats.inCare}
          Icon={PetsRoundedIcon}
          onClick={() => selectTab('bookings')}
        />
        <StatCard
          label="Households"
          value={loadingValue ?? stats.households}
          hint={data.loading ? undefined : `${stats.dogs} ${stats.dogs === 1 ? 'dog' : 'dogs'}`}
          Icon={HomeOutlinedIcon}
          onClick={() => selectTab('households')}
        />
        <StatCard
          label="Next holiday"
          value={loadingValue ?? (stats.nextHoliday ? stats.nextHoliday.name : 'None')}
          hint={
            stats.nextHoliday
              ? formatDateRange(stats.nextHoliday.starts_on, stats.nextHoliday.ends_on)
              : undefined
          }
          Icon={BeachAccessOutlinedIcon}
          onClick={() => selectTab('holidays')}
        />
      </Box>

      <Tabs
        value={active.value}
        onChange={(_, value) => selectTab(value)}
        aria-label="Staff desk sections"
        variant="scrollable"
        scrollButtons={false}
        sx={staffTabsSx}
      >
        {TABS.map(({ value, label, Icon }) => (
          <Tab
            key={value}
            value={value}
            id={`desk-${value}-tab`}
            aria-controls={`desk-${value}-panel`}
            label={
              value === 'bookings' && stats.requests > 0 ? (
                <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                  {label}
                  <Box
                    component="span"
                    aria-label={`${stats.requests} waiting`}
                    sx={{
                      minWidth: 20,
                      height: 20,
                      px: 0.75,
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                      lineHeight: '20px',
                      textAlign: 'center',
                      bgcolor: WEBSITE_ACCENT,
                      color: WEBSITE_INK,
                    }}
                  >
                    {stats.requests}
                  </Box>
                </Box>
              ) : (
                label
              )
            }
            icon={<Icon sx={{ fontSize: 20 }} />}
            iconPosition="start"
            disableRipple
            sx={staffTabSx}
          />
        ))}
      </Tabs>

      <Box sx={{ pb: 6 }}>
        <Panel data={data} notify={notify} />
      </Box>

      <Snackbar
        key={toast?.key}
        open={Boolean(toast)}
        autoHideDuration={3500}
        onClose={(_, reason) => {
          if (reason !== 'clickaway') setToast(null);
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={toast?.message}
        ContentProps={{
          sx: theme => ({
            borderRadius: 999,
            fontWeight: 600,
            bgcolor: theme.palette.mode === 'dark' ? '#FFFCF7' : WEBSITE_INK,
            color: theme.palette.mode === 'dark' ? WEBSITE_INK : '#FFFCF7',
            border: '1px solid',
            borderColor: hairline(theme, 0.1),
          }),
        }}
      />
    </StaffPageShell>
  );
}
