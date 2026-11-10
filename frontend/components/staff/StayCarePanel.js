'use client';

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Box, Checkbox, FormControlLabel, TextField, Typography } from '@mui/material';
import { createCareUpdate, formatApiErrors, listCareUpdates, listVaccines } from '@/lib/daycareApi';
import { RowButton } from './DeskParts';
import {
  buildStayCareBrief,
  canComposeCareUpdate,
  careUpdateAnswers,
  careUpdateByline,
  careUpdateSaveBlocked,
  sortCareUpdatesNewest,
} from './staff-desk';
import { hairline } from './site-image-styles';

function careUpdateRows(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

export function CareUpdateTimeline({ bookingId, token, allowCompose = false }) {
  const [updates, setUpdates] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [potty, setPotty] = useState(false);
  const [food, setFood] = useState(false);
  const [play, setPlay] = useState(false);
  const [medsGiven, setMedsGiven] = useState(false);
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    if (!token || bookingId == null) return undefined;
    let cancelled = false;
    (async () => {
      const res = await listCareUpdates(token, bookingId);
      if (cancelled) return;
      if (!res.ok) {
        setLoadError('Could not load care updates.');
        setUpdates(prev => (prev.length === 0 ? prev : []));
        return;
      }
      const next = careUpdateRows(res.data);
      setLoadError(null);
      setUpdates(prev => {
        if (prev.length === 0 && next.length === 0) return prev;
        return next;
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [token, bookingId, reloadKey]);

  const blocked = careUpdateSaveBlocked({ potty, food, play, medsGiven, body });
  const newest = sortCareUpdatesNewest(updates);

  const save = async () => {
    if (careUpdateSaveBlocked({ potty, food, play, medsGiven, body }) || saving) return;
    setSaving(true);
    setSaveError(null);
    const res = await createCareUpdate(token, bookingId, {
      potty,
      food,
      play,
      meds_given: medsGiven,
      body: String(body).trim(),
    });
    setSaving(false);
    if (!res.ok) {
      setSaveError(formatApiErrors(res.data).summary || 'Could not save that update.');
      return;
    }
    setPotty(false);
    setFood(false);
    setPlay(false);
    setMedsGiven(false);
    setBody('');
    setReloadKey(key => key + 1);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Care updates</Typography>
      {loadError ? (
        <Alert severity="error" sx={{ mt: 1 }}>
          {loadError}
        </Alert>
      ) : null}
      {newest.length === 0 && !loadError ? (
        <Typography sx={{ mt: 0.75, fontSize: 14, color: 'text.secondary' }}>
          No care updates yet.
        </Typography>
      ) : null}
      {newest.length > 0 ? (
        <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, mt: 1 }}>
          {newest.map(update => {
            const note = String(update?.body ?? '').trim();
            const byline = careUpdateByline(update);
            return (
              <Box component="li" key={update.id} sx={{ py: 0.75 }}>
                {byline ? <Typography sx={{ fontSize: 13.5 }}>{byline}</Typography> : null}
                <Typography sx={{ fontSize: 14 }}>{careUpdateAnswers(update)}</Typography>
                {note ? (
                  <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>{note}</Typography>
                ) : null}
              </Box>
            );
          })}
        </Box>
      ) : null}
      {allowCompose ? (
        <Box sx={{ mt: 1.5 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            <FormControlLabel
              control={<Checkbox checked={potty} onChange={event => setPotty(event.target.checked)} />}
              label="Potty"
            />
            <FormControlLabel
              control={<Checkbox checked={food} onChange={event => setFood(event.target.checked)} />}
              label="Food"
            />
            <FormControlLabel
              control={<Checkbox checked={play} onChange={event => setPlay(event.target.checked)} />}
              label="Play"
            />
            <FormControlLabel
              control={
                <Checkbox checked={medsGiven} onChange={event => setMedsGiven(event.target.checked)} />
              }
              label="Meds"
            />
          </Box>
          <TextField
            label="Note"
            value={body}
            onChange={event => setBody(event.target.value)}
            fullWidth
            size="small"
            multiline
            inputComponent="textarea"
            inputProps={{ rows: 3 }}
            sx={{ mt: 1 }}
          />
          {saveError ? (
            <Alert severity="error" sx={{ mt: 1 }}>
              {saveError}
            </Alert>
          ) : null}
          <Box sx={{ mt: 1 }}>
            <RowButton primary disabled={blocked || saving} onClick={save}>
              Save update
            </RowButton>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}

CareUpdateTimeline.propTypes = {
  bookingId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  token: PropTypes.string,
  allowCompose: PropTypes.bool,
};

export default function StayCarePanel({ bookingId, status, dogs, parent, token, vaccinesByDogId }) {
  const [vaccineMap, setVaccineMap] = useState(null);
  const dogKey = (dogs || []).map(dog => dog.id).join(',');

  useEffect(() => {
    if (vaccinesByDogId) return undefined;
    if (!token) return undefined;
    const ids = dogKey === '' ? [] : dogKey.split(',');
    let cancelled = false;
    (async () => {
      const pairs = await Promise.all(
        ids.map(async id => {
          const res = await listVaccines(token, id);
          const rows = res.ok && Array.isArray(res.data) ? res.data : null;
          return [id, rows];
        }),
      );
      if (cancelled) return;
      const next = {};
      pairs.forEach(([id, rows]) => {
        next[id] = rows;
      });
      setVaccineMap(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [token, dogKey, vaccinesByDogId]);

  const brief = buildStayCareBrief({
    dogs,
    parent,
    vaccinesByDogId: vaccinesByDogId || vaccineMap || {},
  });

  return (
    <Box
      sx={theme => ({
        mt: 2,
        pt: 2,
        borderTop: '1px solid',
        borderColor: hairline(theme, 0.12),
      })}
    >
      <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Care brief</Typography>
      {brief.exclusiveLine ? (
        <Typography sx={{ mt: 1, fontWeight: 700, fontSize: 14.5 }}>{brief.exclusiveLine}</Typography>
      ) : null}
      {brief.dogs.map(dog => (
        <Box key={dog.id} sx={{ mt: 1.25 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{dog.name}</Typography>
          <Typography sx={{ fontSize: 14 }}>Medications: {dog.medications}</Typography>
          <Typography sx={{ fontSize: 14 }}>Feeding: {dog.feeding}</Typography>
          <Typography sx={{ fontSize: 14 }}>
            Vet: {dog.vetName} · {dog.vetPhone}
          </Typography>
          {dog.temperament ? (
            <Typography sx={{ fontSize: 14 }}>Temperament: {dog.temperament}</Typography>
          ) : null}
          {dog.notes ? <Typography sx={{ fontSize: 14 }}>Notes: {dog.notes}</Typography> : null}
          {dog.vaccineLines.map(line => (
            <Typography key={line} sx={{ fontSize: 14 }}>
              {line}
            </Typography>
          ))}
        </Box>
      ))}
      <Typography sx={{ mt: 1.25, fontSize: 14 }}>
        Emergency contact: {brief.emergencyName} · {brief.emergencyPhone}
      </Typography>
      <CareUpdateTimeline
        bookingId={bookingId}
        token={token}
        allowCompose={canComposeCareUpdate(status)}
      />
    </Box>
  );
}

StayCarePanel.propTypes = {
  bookingId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  status: PropTypes.string,
  dogs: PropTypes.arrayOf(PropTypes.object),
  parent: PropTypes.object,
  token: PropTypes.string,
  vaccinesByDogId: PropTypes.object,
};
