'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Switch, Tooltip, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RoomServiceOutlinedIcon from '@mui/icons-material/RoomServiceOutlined';
import { createService, deleteService, formatApiErrors, updateService } from '@/lib/daycareApi';
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
import { ServiceDialog } from './DeskDialogs';
import { formatWindow, rateLabel, serviceKindLabel } from './staff-desk';

export default function DeskServicesTab({ data, notify }) {
  const { services, token, reload, loading } = data;
  const [dialog, setDialog] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [busy, setBusy] = useState(false);
  const [removeError, setRemoveError] = useState(null);
  const [toggling, setToggling] = useState(null);

  const toggleActive = async service => {
    setToggling(service.id);
    const res = await updateService(token, service.id, { active: !service.active });
    setToggling(null);
    if (!res.ok) {
      notify(formatApiErrors(res.data).summary || 'Could not change that service.');
      return;
    }
    await reload();
    notify(`${service.name} is ${service.active ? 'hidden from booking' : 'bookable'}.`);
  };

  const confirmRemove = async () => {
    setBusy(true);
    setRemoveError(null);
    const res = await deleteService(token, removing.id);
    setBusy(false);
    if (!res.ok && res.status !== 204) {
      setRemoveError(formatApiErrors(res.data).summary || 'Could not delete that service.');
      return;
    }
    const { name } = removing;
    setRemoving(null);
    await reload();
    notify(`${name} deleted.`);
  };

  return (
    <Box role="tabpanel" id="desk-services-panel" aria-labelledby="desk-services-tab">
      <DeskSectionHeader
        id="staff-services-heading"
        title="Services"
        description="What families can book, and what it costs."
        action={
          <NewButton startIcon={<AddRoundedIcon />} onClick={() => setDialog({})}>
            New service
          </NewButton>
        }
      />

      {loading ? <SkeletonRows count={4} height={70} /> : null}
      {!loading && services.length === 0 ? (
        <EmptyState
          icon={<RoomServiceOutlinedIcon />}
          title="No services yet"
          body="Add a service so families can book it."
        />
      ) : null}

      <Box
        component="ul"
        sx={{
          listStyle: 'none',
          p: 0,
          m: 0,
          mt: 2.5,
          ...flowSx('340px', 1.5),
        }}
      >
        {services.map(service => {
          const inWindow = formatWindow(service.check_in_from, service.check_in_until);
          const outWindow = formatWindow(service.check_out_from, service.check_out_until);
          return (
            <RecordCard component="li" key={service.id} sx={stackSx(1.5)}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography sx={{ fontWeight: 600 }}>{service.name}</Typography>
                    <ToneChip label={serviceKindLabel(service.kind)} tone="neutral" />
                  </Box>
                  <Typography sx={{ mt: 0.5, fontSize: 22, fontWeight: 600 }}>
                    {rateLabel(service)}
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', fontSize: 13 }}>
                    {service.max_dogs_per_day
                      ? `Up to ${service.max_dogs_per_day} dogs a day`
                      : 'No daily cap'}{' '}
                    · /{service.slug}
                  </Typography>
                  {inWindow || outWindow ? (
                    <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 13 }}>
                      {[inWindow && `Check-in ${inWindow}`, outWindow && `Check-out ${outWindow}`]
                        .filter(Boolean)
                        .join(' · ')}
                    </Typography>
                  ) : null}
                </Box>
                <Tooltip
                  title={
                    service.active ? 'Bookable — click to hide' : 'Hidden — click to make bookable'
                  }
                >
                  <Switch
                    checked={Boolean(service.active)}
                    disabled={toggling === service.id}
                    onChange={() => toggleActive(service)}
                    inputProps={{ 'aria-label': `${service.name} bookable` }}
                  />
                </Tooltip>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <RowButton
                  onClick={() => setDialog({ record: service })}
                  aria-label={`Edit ${service.name}`}
                >
                  Edit
                </RowButton>
                <RowButton
                  onClick={() => {
                    setRemoveError(null);
                    setRemoving(service);
                  }}
                  aria-label={`Delete ${service.name}`}
                >
                  Delete
                </RowButton>
              </Box>
            </RecordCard>
          );
        })}
      </Box>

      <ServiceDialog
        open={Boolean(dialog)}
        service={dialog?.record}
        onClose={() => setDialog(null)}
        onSave={body =>
          dialog?.record ? updateService(token, dialog.record.id, body) : createService(token, body)
        }
        onSaved={async saved => {
          const isNew = !dialog?.record;
          setDialog(null);
          await reload();
          notify(`${saved?.name || 'Service'} ${isNew ? 'created' : 'saved'}.`);
        }}
      />
      <ConfirmDialog
        open={Boolean(removing)}
        title={`Delete ${removing?.name || 'service'}?`}
        body="A service that has bookings can’t be deleted. Turn it off instead to hide it from booking."
        confirmLabel="Delete service"
        busy={busy}
        error={removeError}
        onClose={() => setRemoving(null)}
        onConfirm={confirmRemove}
      />
    </Box>
  );
}

DeskServicesTab.propTypes = {
  data: PropTypes.object.isRequired,
  notify: PropTypes.func.isRequired,
};
