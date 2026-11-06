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
  IconButton,
  MenuItem,
  Radio,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import DirectionsWalkOutlinedIcon from '@mui/icons-material/DirectionsWalkOutlined';
import PetsOutlinedIcon from '@mui/icons-material/PetsOutlined';
import GlassFormField from '@/components/design-studio/GlassFormField';
import DogHotelInteriorPage from '@/components/dog-hotel/DogHotelInteriorPage';
import { useAuth } from '@/contexts/AuthContext';
import { ACCOUNT_PATH, CONTACT_PATH } from '@/consts/routes';
import {
  WEBSITE_ACCENT,
  WEBSITE_INK,
  WEBSITE_PAGE_BACKGROUND_MUTED,
  WEBSITE_PAPER,
} from '@/consts/website-theme';
import {
  createBooking,
  formatApiErrors,
  getAvailability,
  listDogs,
  listPetParents,
  listServices,
} from '@/lib/daycareApi';
import { useDaycarePhoto } from './ProfilePhoto';
import {
  availabilityFailureMessage,
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
import { PRIMARY_BUTTON_SX } from './pet-parent-styles';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const BOOKABLE_KINDS = new Set(['daycare', 'boarding', 'walk', 'drop_in']);
const FRAME_MAX_WIDTH = 1120;

const SERVICE_ICON_SRC = {
  daycare: 'sun-daycare',
  boarding: 'home-moon-boarding',
};

const SERVICE_ICONS = {
  walk: DirectionsWalkOutlinedIcon,
  drop_in: PetsOutlinedIcon,
};

const SERVICE_SUBTITLES = {
  daycare: 'Daytime care',
  boarding: 'Overnight care',
  walk: 'One visit, one day',
  drop_in: 'A short visit, one day',
};

const panelSx = {
  bgcolor: alpha(WEBSITE_PAPER, 0.78),
  border: `1px solid ${alpha(WEBSITE_INK, 0.08)}`,
  borderRadius: '20px',
  p: { xs: 2, md: 3 },
};

const choiceCardSx = checked => ({
  m: 0,
  flex: '1 1 210px',
  maxWidth: { xs: '100%', sm: 320 },
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 1,
  px: 1.25,
  py: 1.15,
  borderRadius: '16px',
  border: `1.5px solid ${checked ? WEBSITE_INK : alpha(WEBSITE_INK, 0.12)}`,
  bgcolor: checked ? alpha(WEBSITE_INK, 0.08) : WEBSITE_PAPER,
  boxSizing: 'border-box',
  cursor: 'pointer',
  transition: 'border-color 120ms ease, background-color 120ms ease',
  '&:hover': { borderColor: WEBSITE_INK },
  '& .MuiFormControlLabel-label': { flex: 1, minWidth: 0 },
});

function BookingIcon({ name, size = 24 }) {
  return (
    <Box
      component="img"
      alt=""
      src={`/imgs/booking/${name}.svg`}
      sx={{ width: size, height: size, display: 'block', flexShrink: 0 }}
    />
  );
}

BookingIcon.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.number,
};

function householdLabel(parent) {
  const name = [parent.first_name, parent.last_name].filter(Boolean).join(' ');
  return name || parent.email || `Household ${parent.id}`;
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

function formatStayDates(start, end) {
  const startDate = parseIsoDate(start);
  const endDate = parseIsoDate(end);
  const startMonth = SHORT_MONTHS[startDate.getMonth()];
  const endMonth = SHORT_MONTHS[endDate.getMonth()];
  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();
  if (start === end) return `${startDate.getDate()} ${startMonth} ${startYear}`;
  if (startYear === endYear && startDate.getMonth() === endDate.getMonth()) {
    return `${startDate.getDate()}\u2013${endDate.getDate()} ${startMonth} ${startYear}`;
  }
  if (startYear === endYear) {
    return `${startDate.getDate()} ${startMonth}\u2013${endDate.getDate()} ${endMonth} ${startYear}`;
  }
  return `${startDate.getDate()} ${startMonth} ${startYear}\u2013${endDate.getDate()} ${endMonth} ${endYear}`;
}

function rangeSummary(kind, start, end) {
  if (kind === 'boarding') {
    return `Check-in ${prettyDate(start)}. Checkout ${prettyDate(end)}.`;
  }
  if (isVisitKind(kind) || start === end) return prettyDate(start);
  return `${prettyDate(start)} to ${prettyDate(end)}.`;
}

function rangeHelper(kind) {
  if (isVisitKind(kind)) {
    return 'A walk or drop-in is one day, so another day is a separate request.';
  }
  return 'Consecutive dates form one request. A gap between dates needs its own request.';
}

function joinNames(names) {
  if (names.length <= 1) return names[0] || '';
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
}

function selectedDogLabel(count) {
  return count === 1 ? '1 dog selected' : `${count} dogs selected`;
}

function initialsFor(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return '?';
  return parts
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('');
}

function dayAppearance(info, selected) {
  if (selected) {
    return {
      bgcolor: WEBSITE_INK,
      color: WEBSITE_PAPER,
      borderColor: WEBSITE_INK,
      backgroundImage: 'none',
    };
  }
  if (info?.state === 'closed') {
    return {
      bgcolor: alpha(WEBSITE_INK, 0.16),
      color: alpha(WEBSITE_INK, 0.55),
      borderColor: alpha(WEBSITE_INK, 0.16),
      backgroundImage: 'none',
    };
  }
  if (info?.state === 'unavailable') {
    return {
      bgcolor: WEBSITE_PAPER,
      color: alpha(WEBSITE_INK, 0.5),
      borderColor: alpha(WEBSITE_INK, 0.12),
      backgroundImage: `repeating-linear-gradient(-45deg, ${alpha(WEBSITE_INK, 0.04)}, ${alpha(
        WEBSITE_INK,
        0.04,
      )} 4px, ${alpha(WEBSITE_INK, 0.16)} 4px, ${alpha(WEBSITE_INK, 0.16)} 6px)`,
    };
  }
  return {
    bgcolor: WEBSITE_PAPER,
    color: WEBSITE_INK,
    borderColor: alpha(WEBSITE_INK, 0.1),
    backgroundImage: 'none',
  };
}

function mergeDays(dayMap, days) {
  const next = { ...dayMap };
  days.forEach(day => {
    next[day.date] = { state: day.state, reason: day.reason ?? null };
  });
  return next;
}

function PageIntro() {
  return (
    <Box>
      <Typography
        component="p"
        sx={{
          m: 0,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: WEBSITE_INK,
        }}
      >
        Plan their next stay
      </Typography>
      <Typography
        component="h1"
        sx={{
          mt: 1,
          fontWeight: 800,
          letterSpacing: '-0.02em',
          fontSize: { xs: '2.1rem', md: '2.75rem' },
          lineHeight: 1.1,
          color: WEBSITE_INK,
        }}
      >
        Book a stay
      </Typography>
      <Typography
        component="p"
        sx={{
          mt: 1.25,
          mb: 2.5,
          maxWidth: 560,
          fontSize: { xs: '1rem', md: '1.125rem' },
          lineHeight: 1.55,
          color: alpha(WEBSITE_INK, 0.72),
        }}
      >
        Choose your dogs, service, and dates to send a request.
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.25,
          px: 2,
          py: 1.35,
          borderRadius: '14px',
          bgcolor: WEBSITE_PAGE_BACKGROUND_MUTED,
          color: WEBSITE_INK,
        }}
      >
        <BookingIcon name="info-circle" size={22} />
        <Typography sx={{ fontSize: 15, lineHeight: 1.45 }}>
          Your stay is only booked once staff confirm your request.
        </Typography>
      </Box>
    </Box>
  );
}

function StepHeading({ number, title, children }) {
  return (
    <Box sx={{ mb: 1.75 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <BookingIcon name={`step-0${number}`} size={32} />
        <Typography
          component="h2"
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1.2rem', md: '1.4rem' },
            letterSpacing: '-0.01em',
            color: WEBSITE_INK,
          }}
        >
          {title}
        </Typography>
      </Box>
      {children ? (
        <Typography
          sx={{
            mt: 0.75,
            ml: { xs: 0, sm: '42px' },
            fontSize: 14.5,
            lineHeight: 1.45,
            color: alpha(WEBSITE_INK, 0.65),
          }}
        >
          {children}
        </Typography>
      ) : null}
    </Box>
  );
}

StepHeading.propTypes = {
  number: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
};

function DogAvatar({ name, photoUrl, token, size }) {
  const src = useDaycarePhoto(photoUrl, token);
  const direct =
    !src && typeof photoUrl === 'string' && /^https?:\/\//.test(photoUrl) ? photoUrl : null;
  const image = src || direct;

  return (
    <Box
      aria-hidden
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        bgcolor: alpha(WEBSITE_INK, 0.1),
        color: WEBSITE_INK,
        fontWeight: 700,
        fontSize: Math.round(size * 0.34),
      }}
    >
      {image ? (
        <Box
          component="img"
          src={image}
          alt=""
          sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        initialsFor(name)
      )}
    </Box>
  );
}

DogAvatar.propTypes = {
  name: PropTypes.string,
  photoUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf([null])]),
  token: PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf([null])]),
  size: PropTypes.number.isRequired,
};

function DogChoice({ dog, token, checked, onChange }) {
  return (
    <FormControlLabel
      labelPlacement="start"
      sx={choiceCardSx(checked)}
      control={
        <Checkbox
          checked={checked}
          onChange={onChange}
          icon={
            <Box
              sx={{
                width: 22,
                height: 22,
                borderRadius: '4px',
                border: `1.5px solid ${alpha(WEBSITE_INK, 0.28)}`,
                boxSizing: 'border-box',
              }}
            />
          }
          checkedIcon={<BookingIcon name="checkbox-selected" size={22} />}
          sx={{ p: 0.5 }}
        />
      }
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0, py: 0.25 }}>
          <DogAvatar name={dog.name} photoUrl={dog.photo_url} token={token} size={52} />
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 16, lineHeight: 1.2, color: WEBSITE_INK }}>
              {dog.name}
            </Typography>
            <Typography
              sx={{ mt: 0.35, fontSize: 13, lineHeight: 1.3, color: alpha(WEBSITE_INK, 0.62) }}
            >
              {dog.good_with_dogs ? 'Good with other dogs' : 'Not good with other dogs'}
            </Typography>
          </Box>
        </Box>
      }
    />
  );
}

DogChoice.propTypes = {
  dog: PropTypes.shape({
    name: PropTypes.string,
    photo_url: PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf([null])]),
    good_with_dogs: PropTypes.bool,
  }).isRequired,
  token: PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf([null])]),
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

function ServiceChoice({ service, selected, onSelect }) {
  const conceptIcon = SERVICE_ICON_SRC[service.kind];
  const Icon = SERVICE_ICONS[service.kind] || PetsOutlinedIcon;
  const subtitle = SERVICE_SUBTITLES[service.kind] || '';

  return (
    <FormControlLabel
      labelPlacement="start"
      sx={{ ...choiceCardSx(selected), maxWidth: 'none', width: '100%' }}
      control={
        <Radio
          checked={selected}
          onChange={onSelect}
          value={String(service.id)}
          name="stay-service"
          icon={<BookingIcon name="radio-unselected" size={22} />}
          checkedIcon={<BookingIcon name="radio-selected" size={22} />}
          sx={{ p: 0.5 }}
        />
      }
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0, py: 0.4 }}>
          {conceptIcon ? (
            <BookingIcon name={conceptIcon} size={30} />
          ) : (
            <Icon sx={{ fontSize: 26, color: WEBSITE_INK, flexShrink: 0 }} />
          )}
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 16, lineHeight: 1.2, color: WEBSITE_INK }}>
              {service.name}
            </Typography>
            {subtitle ? (
              <Typography sx={{ mt: 0.3, fontSize: 13, color: alpha(WEBSITE_INK, 0.62) }}>
                {subtitle}
              </Typography>
            ) : null}
          </Box>
        </Box>
      }
    />
  );
}

ServiceChoice.propTypes = {
  service: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    name: PropTypes.string,
    kind: PropTypes.string,
  }).isRequired,
  selected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
};

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
      }}
    >
      {WEEKDAYS.map(label => (
        <Typography
          key={label}
          component="span"
          sx={{
            textAlign: 'center',
            fontSize: 12,
            fontWeight: 700,
            color: alpha(WEBSITE_INK, 0.45),
            pb: 0.5,
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
        const ariaParts = [isCheckout ? `Checkout ${prettyDate(iso)}` : prettyDate(iso)];
        if (past) ariaParts.push('past');
        ariaParts.push(phrase);
        const ariaLabel = ariaParts.join(', ');
        const look = dayAppearance(info, selected);
        const showJoinDot = info?.state === 'joinable' && !selected;

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
              position: 'relative',
              minHeight: 46,
              borderRadius: '10px',
              border: '1px solid',
              font: 'inherit',
              fontSize: 14,
              fontWeight: selected ? 700 : 600,
              lineHeight: 1,
              cursor: selectable ? 'pointer' : 'not-allowed',
              opacity: past ? 0.4 : 1,
              ...look,
            }}
          >
            {day}
            {showJoinDot ? (
              <Box
                component="span"
                aria-hidden
                sx={{
                  position: 'absolute',
                  left: '50%',
                  bottom: 5,
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  bgcolor: WEBSITE_ACCENT,
                  transform: 'translateX(-50%)',
                }}
              />
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

function DateLegend() {
  const items = [
    { key: 'available', label: 'Available', icon: 'state-available' },
    { key: 'joinable', label: 'Joinable', icon: 'state-joinable' },
    { key: 'selected', label: 'Selected', icon: 'state-selected' },
    { key: 'blocked', label: 'Blocked', icon: 'state-booked' },
    { key: 'closed', label: 'Closed', icon: 'state-closed' },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 1.5,
        mt: 1.75,
      }}
    >
      {items.map(item => (
        <Box key={item.key} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <BookingIcon name={item.icon} size={16} />
          <Typography sx={{ fontSize: 13, color: alpha(WEBSITE_INK, 0.72) }}>
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function SummaryRow({ label, value }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        gap: 2,
        py: 1.15,
        borderTop: `1px solid ${alpha(WEBSITE_INK, 0.08)}`,
      }}
    >
      <Typography sx={{ fontSize: 14.5, color: alpha(WEBSITE_INK, 0.62) }}>{label}</Typography>
      <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: WEBSITE_INK, textAlign: 'right' }}>
        {value}
      </Typography>
    </Box>
  );
}

SummaryRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

function RequestSummary({ dogs, token, serviceName, dates, requestLabel, submitting, canSubmit }) {
  const names = joinNames(dogs.map(dog => dog.name).filter(Boolean));

  return (
    <Box
      sx={{
        bgcolor: WEBSITE_PAPER,
        border: `1px solid ${alpha(WEBSITE_INK, 0.08)}`,
        borderRadius: '20px',
        boxShadow: '0 16px 40px rgba(11, 60, 67, 0.06)',
        p: { xs: 2.25, md: 2.75 },
        position: { md: 'sticky' },
        top: { md: 12 },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <BookingIcon name="calendar-request" size={26} />
        <Typography
          component="h2"
          sx={{ fontWeight: 800, fontSize: '1.35rem', color: WEBSITE_INK }}
        >
          Your request
        </Typography>
      </Box>

      {dogs.length > 0 ? (
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.25 }}>
            {dogs.map((dog, index) => (
              <Box
                key={dog.id}
                sx={{
                  ml: index === 0 ? 0 : -1.75,
                  zIndex: dogs.length - index,
                  borderRadius: '50%',
                  border: `3px solid ${WEBSITE_PAPER}`,
                }}
              >
                <DogAvatar name={dog.name} photoUrl={dog.photo_url} token={token} size={68} />
              </Box>
            ))}
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: 18, color: WEBSITE_INK }}>
            {names}
          </Typography>
          <Typography sx={{ mt: 0.35, fontSize: 14, color: alpha(WEBSITE_INK, 0.6) }}>
            {selectedDogLabel(dogs.length)}
          </Typography>
        </Box>
      ) : (
        <Typography sx={{ mb: 2, textAlign: 'center', color: alpha(WEBSITE_INK, 0.6) }}>
          No dogs selected
        </Typography>
      )}

      <SummaryRow label="Service" value={serviceName || '\u2014'} />
      <SummaryRow label="Dates" value={dates} />
      <SummaryRow label="Requests" value={requestLabel} />

      <Box
        sx={{
          mt: 2,
          mb: 2,
          display: 'flex',
          gap: 1.25,
          alignItems: 'flex-start',
          bgcolor: alpha(WEBSITE_ACCENT, 0.16),
          borderRadius: '14px',
          px: 1.5,
          py: 1.35,
        }}
      >
        <BookingIcon name="clock-review" size={22} />
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: 14.5, color: WEBSITE_INK }}>
            Staff confirmation required
          </Typography>
          <Typography
            sx={{ mt: 0.35, fontSize: 13.5, lineHeight: 1.4, color: alpha(WEBSITE_INK, 0.75) }}
          >
            We&apos;ll review your request before the stay is booked.
          </Typography>
        </Box>
      </Box>

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={!canSubmit}
        endIcon={submitting ? null : <BookingIcon name="arrow-right-cream" size={18} />}
        sx={{
          bgcolor: WEBSITE_ACCENT,
          color: '#fff',
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 800,
          fontSize: 16,
          py: 1.35,
          boxShadow: 'none',
          '&:hover': { bgcolor: '#C47A38', boxShadow: 'none' },
          '&.Mui-disabled': {
            bgcolor: alpha(WEBSITE_ACCENT, 0.45),
            color: alpha('#fff', 0.92),
          },
        }}
      >
        {submitting ? 'Sending…' : 'Send stay request'}
      </Button>
      <Typography
        sx={{ mt: 1.1, textAlign: 'center', fontSize: 13, color: alpha(WEBSITE_INK, 0.58) }}
      >
        Submitting sends a request, not a confirmed booking.
      </Typography>

      <Box sx={{ display: 'flex', gap: 1.25, mt: 2.5, alignItems: 'flex-start' }}>
        <BookingIcon name="chat-help" size={22} />
        <Box>
          <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: WEBSITE_INK }}>
            Need help choosing dates?
          </Typography>
          <Typography
            component={Link}
            href={CONTACT_PATH}
            sx={{
              display: 'inline-block',
              mt: 0.25,
              fontSize: 14.5,
              fontWeight: 700,
              color: WEBSITE_INK,
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
            }}
          >
            Contact
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

RequestSummary.propTypes = {
  dogs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      name: PropTypes.string,
      photo_url: PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf([null])]),
    }),
  ).isRequired,
  token: PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf([null])]),
  serviceName: PropTypes.string,
  dates: PropTypes.string.isRequired,
  requestLabel: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
  canSubmit: PropTypes.bool.isRequired,
};

const stepRuleSx = {
  pt: 3,
  mt: 3,
  borderTop: `1px solid ${alpha(WEBSITE_INK, 0.08)}`,
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
          scopedDogs.filter(dog => ownId == null || dog.pet_parent_id === ownId).map(dog => dog.id),
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

  const selectedDogs = visibleDogs.filter(dog => selectedIds.includes(dog.id));
  const rangeReady = Boolean(range.start && range.end);
  const summaryDates = range.start
    ? formatStayDates(range.start, range.end || range.start)
    : '\u2014';
  const showCalendar = selectedIds.length > 0 && Boolean(serviceId);
  const canSubmit = !submitting && rangeReady && selectedIds.length > 0;
  const otherFieldErrors = Object.entries(fieldErrors).filter(([field]) => field !== 'parent_note');

  if (submitted) {
    return (
      <DogHotelInteriorPage title="Book a stay" frameMaxWidth={FRAME_MAX_WIDTH}>
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

  return (
    <DogHotelInteriorPage title="Book a stay" suppressHeading frameMaxWidth={FRAME_MAX_WIDTH}>
      <PageIntro />
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
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          {summaryError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {summaryError}
            </Alert>
          ) : null}
          {otherFieldErrors.map(([field, text]) => (
            <Alert key={field} severity="error" sx={{ mb: 2 }}>
              {text}
            </Alert>
          ))}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 320px' },
              gap: { xs: 2.5, md: 3 },
              alignItems: 'start',
            }}
          >
            <Box sx={panelSx}>
              {showHouseholds ? (
                <Box sx={{ maxWidth: 360, mb: 3 }}>
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
                </Box>
              ) : null}

              <Box>
                <StepHeading number="1" title="Who's coming?">
                  All dogs are selected. Uncheck anyone staying home.
                </StepHeading>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
                  {visibleDogs.map(dog => (
                    <DogChoice
                      key={dog.id}
                      dog={dog}
                      token={token}
                      checked={selectedIds.includes(dog.id)}
                      onChange={handleDogToggle(dog.id)}
                    />
                  ))}
                </Box>
                {selectedIds.length === 0 ? (
                  <Typography sx={{ mt: 1.25, color: WEBSITE_INK }}>
                    Choose at least one dog.
                  </Typography>
                ) : null}
              </Box>

              <Box sx={stepRuleSx}>
                <StepHeading number="2" title="Choose a service" />
                {services.length === 0 ? (
                  <Alert severity="info">No services are open for requests right now.</Alert>
                ) : (
                  <Box
                    role="radiogroup"
                    aria-label="Service"
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                      gap: 1.25,
                    }}
                  >
                    {services.map(service => (
                      <ServiceChoice
                        key={service.id}
                        service={service}
                        selected={String(service.id) === String(serviceId)}
                        onSelect={() => setServiceId(String(service.id))}
                      />
                    ))}
                  </Box>
                )}
                {fieldErrors.service_id ? (
                  <Typography sx={{ mt: 1, fontSize: 13, color: 'error.main' }}>
                    {fieldErrors.service_id}
                  </Typography>
                ) : null}
              </Box>

              <Box sx={stepRuleSx}>
                <StepHeading number="3" title="Choose your dates">
                  Select the dates you&apos;d like to request.
                </StepHeading>
                {showCalendar ? (
                  <Box sx={{ width: '100%', maxWidth: 560, mx: 'auto', textAlign: 'center' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 1.5,
                      }}
                    >
                      <IconButton
                        type="button"
                        aria-label="Previous"
                        onClick={() => shiftMonth(-1)}
                        sx={{
                          color: WEBSITE_INK,
                          border: `1px solid ${alpha(WEBSITE_INK, 0.14)}`,
                        }}
                      >
                        <BookingIcon name="chevron-left" size={18} />
                      </IconButton>
                      <Typography
                        component="p"
                        sx={{
                          flex: 1,
                          m: 0,
                          textAlign: 'center',
                          fontWeight: 800,
                          fontSize: 20,
                          color: WEBSITE_INK,
                        }}
                      >
                        {visible.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </Typography>
                      <IconButton
                        type="button"
                        aria-label="Next"
                        onClick={() => shiftMonth(1)}
                        sx={{
                          color: WEBSITE_INK,
                          border: `1px solid ${alpha(WEBSITE_INK, 0.14)}`,
                        }}
                      >
                        <BookingIcon name="chevron-right" size={18} />
                      </IconButton>
                    </Box>
                    {monthLoading ? (
                      <Typography sx={{ mb: 1, textAlign: 'center' }}>
                        Loading availability…
                      </Typography>
                    ) : null}
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
                    <DateLegend />
                    <Typography
                      sx={{
                        mt: 1.5,
                        fontSize: 14,
                        color: alpha(WEBSITE_INK, 0.7),
                        textAlign: 'center',
                      }}
                    >
                      {rangeHelper(selectedService?.kind)}
                    </Typography>
                    {range.start && !range.end ? (
                      <Typography sx={{ mt: 1, color: WEBSITE_INK, textAlign: 'center' }}>
                        {selectedService?.kind === 'boarding'
                          ? `Check-in ${prettyDate(range.start)}. Choose a checkout date after that day.`
                          : `Start ${prettyDate(range.start)}. Choose an end date. The same day is fine.`}
                      </Typography>
                    ) : null}
                    {range.start && range.end ? (
                      <Typography sx={{ mt: 1, color: WEBSITE_INK, textAlign: 'center' }}>
                        {rangeSummary(selectedService?.kind, range.start, range.end)}
                      </Typography>
                    ) : null}
                    {rangeError ? (
                      <Alert severity="warning" sx={{ mt: 1.5 }}>
                        {rangeError}
                      </Alert>
                    ) : null}
                  </Box>
                ) : (
                  <Typography sx={{ color: alpha(WEBSITE_INK, 0.7) }}>
                    Choose at least one dog and a service to see open dates.
                  </Typography>
                )}
              </Box>

              <Box sx={stepRuleSx}>
                <StepHeading number="4" title="Note for staff (optional)" />
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  placeholder="Anything we should know about this stay?"
                  value={note}
                  onChange={event => setNote(event.target.value)}
                  error={Boolean(fieldErrors.parent_note)}
                  helperText={fieldErrors.parent_note}
                  inputProps={{ 'aria-label': 'Note for staff' }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: WEBSITE_PAPER,
                      borderRadius: '14px',
                      color: WEBSITE_INK,
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(WEBSITE_INK, 0.16),
                    },
                    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(WEBSITE_INK, 0.35),
                    },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: WEBSITE_INK,
                    },
                  }}
                />
              </Box>
            </Box>

            <RequestSummary
              dogs={selectedDogs}
              token={token}
              serviceName={selectedService?.name || ''}
              dates={summaryDates}
              requestLabel={rangeReady ? '1 stay request' : '\u2014'}
              submitting={submitting}
              canSubmit={canSubmit}
            />
          </Box>
        </Box>
      ) : null}
    </DogHotelInteriorPage>
  );
}
