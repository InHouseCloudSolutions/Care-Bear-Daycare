'use client';

import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import BeachAccessOutlinedIcon from '@mui/icons-material/BeachAccessOutlined';
import { createClosure, deleteClosure, formatApiErrors, updateClosure } from '@/lib/daycareApi';
import {
  ConfirmDialog,
  DeskSectionHeader,
  EmptyState,
  GroupLabel,
  NewButton,
  RecordCard,
  RowButton,
  SkeletonRows,
  ToneChip,
  stackSx,
} from './DeskParts';
import { HolidayDialog } from './DeskDialogs';
import { daySpan, formatDateRange, holidayKindLabel, todayIso } from './staff-desk';

function HolidayRow({ holiday, today, onEdit, onRemove }) {
  const span = daySpan(holiday.starts_on, holiday.ends_on);
  const now = holiday.starts_on <= today && holiday.ends_on >= today;
  const past = holiday.ends_on < today;
  const isSurcharge = holiday.kind === 'surcharge';
  const kindLabel = holidayKindLabel(holiday);
  let spanSuffix = '';
  if (span) {
    spanSuffix = ` · ${span} day${span === 1 ? '' : 's'}`;
    if (!isSurcharge) spanSuffix += ' closed';
  }
  return (
    <RecordCard
      component="li"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        flexWrap: 'wrap',
        ...(past && { opacity: 0.72 }),
      }}
    >
      <Box sx={{ minWidth: 0, flex: '1 1 220px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography sx={{ fontWeight: 600 }}>{holiday.name}</Typography>
          <ToneChip label={kindLabel} tone={isSurcharge ? 'neutral' : 'muted'} />
          {now ? (
            <ToneChip label={isSurcharge ? 'Surcharge today' : 'Closed today'} tone="accent" />
          ) : null}
        </Box>
        <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 14 }}>
          {formatDateRange(holiday.starts_on, holiday.ends_on)}
          {spanSuffix}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
        <RowButton onClick={onEdit} aria-label={`Edit ${holiday.name}`}>
          Edit
        </RowButton>
        <RowButton onClick={onRemove} aria-label={`Remove ${holiday.name}`}>
          Remove
        </RowButton>
      </Box>
    </RecordCard>
  );
}

HolidayRow.propTypes = {
  holiday: PropTypes.object.isRequired,
  today: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default function DeskHolidaysTab({ data, notify }) {
  const { closures, token, reload, loading } = data;
  const [dialog, setDialog] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [removeBusy, setRemoveBusy] = useState(false);
  const [removeError, setRemoveError] = useState(null);
  const today = todayIso();

  const { upcoming, past } = useMemo(() => {
    const sorted = [...closures].sort((a, b) => a.starts_on.localeCompare(b.starts_on));
    return {
      upcoming: sorted.filter(item => item.ends_on >= today),
      past: sorted.filter(item => item.ends_on < today).reverse(),
    };
  }, [closures, today]);

  const confirmRemove = async () => {
    setRemoveBusy(true);
    setRemoveError(null);
    const res = await deleteClosure(token, removing.id);
    setRemoveBusy(false);
    if (!res.ok && res.status !== 204) {
      setRemoveError(formatApiErrors(res.data).summary || 'Could not remove that holiday.');
      return;
    }
    const { name } = removing;
    setRemoving(null);
    await reload();
    notify(`${name} removed.`);
  };

  const renderList = rows => (
    <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, mt: 1.5, ...stackSx(1.5) }}>
      {rows.map(holiday => (
        <HolidayRow
          key={holiday.id}
          holiday={holiday}
          today={today}
          onEdit={() => setDialog({ record: holiday })}
          onRemove={() => {
            setRemoveError(null);
            setRemoving(holiday);
          }}
        />
      ))}
    </Box>
  );

  return (
    <Box role="tabpanel" id="desk-holidays-panel" aria-labelledby="desk-holidays-tab">
      <DeskSectionHeader
        id="staff-holidays-heading"
        title="Holidays"
        description="Close days entirely, or keep them open and add a percent only on those dates."
        action={
          <NewButton startIcon={<AddRoundedIcon />} onClick={() => setDialog({})}>
            New holiday
          </NewButton>
        }
      />

      {loading ? <SkeletonRows count={2} height={70} /> : null}

      {!loading && closures.length === 0 ? (
        <EmptyState
          icon={<BeachAccessOutlinedIcon />}
          title="No holidays yet"
          body="Add a closed holiday or an open day with a percent surcharge."
        />
      ) : null}

      {!loading && upcoming.length > 0 ? (
        <Box sx={{ mt: 2.5 }}>
          <GroupLabel>Coming up</GroupLabel>
          {renderList(upcoming)}
        </Box>
      ) : null}
      {!loading && past.length > 0 ? (
        <Box sx={{ mt: 3 }}>
          <GroupLabel>Past</GroupLabel>
          {renderList(past)}
        </Box>
      ) : null}

      <HolidayDialog
        open={Boolean(dialog)}
        holiday={dialog?.record}
        onClose={() => setDialog(null)}
        onSave={body =>
          dialog?.record ? updateClosure(token, dialog.record.id, body) : createClosure(token, body)
        }
        onSaved={async saved => {
          const isNew = !dialog?.record;
          setDialog(null);
          await reload();
          notify(`${saved?.name || 'Holiday'} ${isNew ? 'added' : 'saved'}.`);
        }}
      />
      <ConfirmDialog
        open={Boolean(removing)}
        title={`Remove ${removing?.name || 'holiday'}?`}
        body="Closed days open for booking again, or the surcharge drops. Confirmed stays don’t change."
        confirmLabel="Remove holiday"
        busy={removeBusy}
        error={removeError}
        onClose={() => setRemoving(null)}
        onConfirm={confirmRemove}
      />
    </Box>
  );
}

DeskHolidaysTab.propTypes = {
  data: PropTypes.object.isRequired,
  notify: PropTypes.func.isRequired,
};
