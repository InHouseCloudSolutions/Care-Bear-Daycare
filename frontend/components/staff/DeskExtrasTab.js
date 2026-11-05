'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Switch, Tooltip, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import { createExtra, deleteExtra, formatApiErrors, updateExtra } from '@/lib/daycareApi';
import {
  ConfirmDialog,
  DeskSectionHeader,
  EmptyState,
  NewButton,
  RecordCard,
  RowButton,
  SkeletonRows,
  ToneChip,
  flowSx,
  stackSx,
} from './DeskParts';
import { ExtraDialog } from './DeskDialogs';
import { extraKindLabel, moneyLabel } from './staff-desk';

export default function DeskExtrasTab({ data, notify }) {
  const { extras, token, reload, loading } = data;
  const [dialog, setDialog] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [busy, setBusy] = useState(false);
  const [removeError, setRemoveError] = useState(null);
  const [toggling, setToggling] = useState(null);

  const toggleActive = async extra => {
    setToggling(extra.id);
    const res = await updateExtra(token, extra.id, { active: !extra.active });
    setToggling(null);
    if (!res.ok) {
      notify(formatApiErrors(res.data).summary || 'Could not change that extra.');
      return;
    }
    await reload();
    notify(`${extra.name} is ${extra.active ? 'inactive' : 'active'}.`);
  };

  const confirmRemove = async () => {
    setBusy(true);
    setRemoveError(null);
    const res = await deleteExtra(token, removing.id);
    setBusy(false);
    if (!res.ok && res.status !== 204) {
      setRemoveError(formatApiErrors(res.data).summary || 'Could not delete that extra.');
      return;
    }
    const { name } = removing;
    setRemoving(null);
    await reload();
    notify(`${name} deleted.`);
  };

  return (
    <Box role="tabpanel" id="desk-extras-panel" aria-labelledby="desk-extras-tab">
      <DeskSectionHeader
        id="staff-extras-heading"
        title="Extras"
        description="Billable add-ons staff can attach to a stay, like a bath or nail trim."
        action={
          <NewButton startIcon={<AddRoundedIcon />} onClick={() => setDialog({})}>
            New extra
          </NewButton>
        }
      />

      {loading ? <SkeletonRows count={3} height={70} /> : null}
      {!loading && extras.length === 0 ? (
        <EmptyState
          icon={<LocalOfferOutlinedIcon />}
          title="No extras yet"
          body="Add an item families can be charged for during a stay."
        />
      ) : null}

      <Box
        component="ul"
        sx={{
          listStyle: 'none',
          p: 0,
          m: 0,
          mt: 2.5,
          ...flowSx('280px', 1.5),
        }}
      >
        {extras.map(extra => (
          <RecordCard component="li" key={extra.id} sx={stackSx(1.5)}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography sx={{ fontWeight: 600 }}>{extra.name}</Typography>
                  <ToneChip
                    label={extraKindLabel(extra.kind)}
                    tone={extra.kind === 'late_checkout' ? 'accent' : 'neutral'}
                  />
                </Box>
                <Typography sx={{ mt: 0.5, fontSize: 22, fontWeight: 600 }}>
                  {moneyLabel(extra.unit_price)}
                </Typography>
              </Box>
              <Tooltip
                title={
                  extra.active ? 'Active — click to deactivate' : 'Inactive — click to activate'
                }
              >
                <Switch
                  checked={Boolean(extra.active)}
                  disabled={toggling === extra.id}
                  onChange={() => toggleActive(extra)}
                  inputProps={{ 'aria-label': `${extra.name} active` }}
                />
              </Tooltip>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <RowButton
                onClick={() => setDialog({ record: extra })}
                aria-label={`Edit ${extra.name}`}
              >
                Edit
              </RowButton>
              <RowButton
                onClick={() => {
                  setRemoveError(null);
                  setRemoving(extra);
                }}
                aria-label={`Delete ${extra.name}`}
              >
                Delete
              </RowButton>
            </Box>
          </RecordCard>
        ))}
      </Box>

      <ExtraDialog
        open={Boolean(dialog)}
        extra={dialog?.record}
        onClose={() => setDialog(null)}
        onSave={body =>
          dialog?.record ? updateExtra(token, dialog.record.id, body) : createExtra(token, body)
        }
        onSaved={async saved => {
          const isNew = !dialog?.record;
          setDialog(null);
          await reload();
          notify(`${saved?.name || 'Extra'} ${isNew ? 'created' : 'saved'}.`);
        }}
      />
      <ConfirmDialog
        open={Boolean(removing)}
        title={`Delete ${removing?.name || 'extra'}?`}
        body="Lines already on a booking keep the price they were added at. This only removes it from the catalog."
        confirmLabel="Delete extra"
        busy={busy}
        error={removeError}
        onClose={() => setRemoving(null)}
        onConfirm={confirmRemove}
      />
    </Box>
  );
}

DeskExtrasTab.propTypes = {
  data: PropTypes.object.isRequired,
  notify: PropTypes.func.isRequired,
};
