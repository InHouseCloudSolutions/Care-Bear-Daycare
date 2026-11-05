'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  listBookings,
  listClosures,
  listDogs,
  listExtras,
  listPetParents,
  listServices,
} from '@/lib/daycareApi';
import { asRecordList } from './staff-desk';

const SOURCES = [
  { key: 'bookings', label: 'bookings', load: listBookings },
  { key: 'parents', label: 'households', load: listPetParents },
  { key: 'dogs', label: 'dogs', load: listDogs },
  { key: 'services', label: 'services', load: token => listServices(token, { all: true }) },
  { key: 'extras', label: 'extras', load: listExtras },
  { key: 'closures', label: 'holidays', load: listClosures },
];

const EMPTY = { bookings: [], parents: [], dogs: [], services: [], extras: [], closures: [] };

/**
 * Everything the staff desk shows, loaded once and shared by every tab.
 * `reload()` refetches all lists after a change; `loadError` names the lists that failed.
 */
export default function useStaffDeskData() {
  const { token } = useAuth();
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const reload = useCallback(async () => {
    if (!token) return;
    const results = await Promise.all(SOURCES.map(source => source.load(token)));
    const next = { ...EMPTY };
    const failed = [];
    results.forEach((res, index) => {
      const { key, label } = SOURCES[index];
      const rows = asRecordList(res?.data);
      if (!res?.ok || !rows) failed.push(label);
      next[key] = rows || [];
    });
    setData(next);
    setLoadError(failed.length ? `Could not load ${failed.join(', ')}.` : null);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { ...data, loading, loadError, reload, token };
}
