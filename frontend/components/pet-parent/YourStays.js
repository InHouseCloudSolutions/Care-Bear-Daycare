'use client';

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Box, Typography } from '@mui/material';
import { CareUpdateTimeline } from '@/components/staff/StayCarePanel';
import { bookingStatusLabel, dogsOnBooking, formatDateRange } from '@/components/staff/staff-desk';
import { listBookings } from '@/lib/daycareApi';
import { CARD_SX, SECTION_HEADING_SX } from './pet-parent-styles';

export default function YourStays({ token, dogs }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      const res = await listBookings(token);
      if (cancelled) return;
      setLoading(false);
      if (!res.ok || !Array.isArray(res.data)) {
        setError('Could not load your stays.');
        setBookings([]);
        return;
      }
      setError(null);
      setBookings(res.data);
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <Box>
      <Typography component="h2" sx={SECTION_HEADING_SX}>
        Your stays
      </Typography>
      {error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : null}
      {!loading && !error && bookings.length === 0 ? (
        <Typography sx={{ mt: 2 }}>No stays yet.</Typography>
      ) : null}
      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {bookings.map(booking => {
          const names = dogsOnBooking(booking, dogs).map(dog => dog.name);
          return (
            <Box key={booking.id} sx={CARD_SX}>
              <Typography sx={{ fontWeight: 700 }}>{bookingStatusLabel(booking.status)}</Typography>
              <Typography sx={{ mt: 0.5 }}>
                {formatDateRange(booking.starts_on, booking.ends_on)}
              </Typography>
              <Typography sx={{ mt: 0.5 }}>{names.length ? names.join(', ') : 'No dogs'}</Typography>
              <CareUpdateTimeline bookingId={booking.id} token={token} allowCompose={false} />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

YourStays.propTypes = {
  token: PropTypes.string,
  dogs: PropTypes.arrayOf(PropTypes.object),
};
