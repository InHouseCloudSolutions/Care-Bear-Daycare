'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useDaycarePhoto } from '@/components/pet-parent/ProfilePhoto';
import ClientProfileView from '@/components/pet-parent/ClientProfileView';
import { WEBSITE_ACCENT, WEBSITE_INK } from '@/consts/website-theme';
import {
  createBooking,
  createDog,
  createPetParent,
  deleteDog,
  deletePetParent,
  deletePetParentPhoto,
  formatApiErrors,
  updateDog,
  updatePetParent,
  uploadPetParentPhoto,
} from '@/lib/daycareApi';
import {
  ConfirmDialog,
  DeskSectionHeader,
  EmptyState,
  NewButton,
  SkeletonRows,
  StatusChip,
  stackSx,
} from './DeskParts';
import { DogDialog, HouseholdDialog, StayDialog } from './DeskDialogs';
import {
  formatDateRange,
  householdInitials,
  householdLabel,
  householdMatches,
  sortBookings,
} from './staff-desk';
import { cardIconSx, hairline } from './site-image-styles';

function ActionMenu({ label, items }) {
  const menuId = useId();
  const [anchor, setAnchor] = useState(null);
  const open = Boolean(anchor);

  return (
    <>
      <IconButton
        aria-label={label}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        aria-expanded={open ? 'true' : undefined}
        onClick={event => setAnchor(event.currentTarget)}
        sx={theme => ({ ...cardIconSx(theme), width: 40, height: 40, flexShrink: 0 })}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id={menuId}
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {items.map(item => (
          <MenuItem
            key={item.id}
            onClick={() => {
              setAnchor(null);
              item.onClick();
            }}
            sx={{
              minHeight: 44,
              fontWeight: 600,
              ...(item.danger ? { color: 'error.main' } : null),
            }}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

ActionMenu.propTypes = {
  label: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      danger: PropTypes.bool,
    }),
  ).isRequired,
};

function HouseholdAvatar({ parent, token, size = 40 }) {
  const src = useDaycarePhoto(parent?.photo_url, token);
  return (
    <Avatar
      src={src || undefined}
      alt=""
      sx={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        fontWeight: 700,
        bgcolor: alpha(WEBSITE_ACCENT, 0.9),
        color: WEBSITE_INK,
      }}
    >
      {householdInitials(parent)}
    </Avatar>
  );
}

HouseholdAvatar.propTypes = {
  parent: PropTypes.object,
  token: PropTypes.string,
  size: PropTypes.number,
};

export default function DeskHouseholdsTab({ data, notify }) {
  const { parents, dogs, bookings, services, token, reload, loading } = data;
  const theme = useTheme();
  const wide = useMediaQuery(theme.breakpoints.up('md'));
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [removeKind, setRemoveKind] = useState('household');
  const [removeName, setRemoveName] = useState('');
  const [removeBusy, setRemoveBusy] = useState(false);
  const [removeError, setRemoveError] = useState(null);

  const filtered = useMemo(
    () =>
      [...parents]
        .filter(parent => householdMatches(parent, query, dogs))
        .sort((a, b) => householdLabel(a).localeCompare(householdLabel(b))),
    [parents, dogs, query],
  );

  // On wide screens keep a household open; on phones the list shows until one is tapped.
  useEffect(() => {
    if (!wide || loading) return;
    if (selectedId == null || !parents.some(parent => parent.id === selectedId)) {
      setSelectedId(filtered[0]?.id ?? null);
    }
  }, [wide, loading, parents, filtered, selectedId]);

  const selected = parents.find(parent => parent.id === selectedId) || null;
  const selectedDogs = selected ? dogs.filter(dog => dog.pet_parent_id === selected.id) : [];
  const selectedStays = selected
    ? sortBookings(bookings.filter(booking => booking.pet_parent_id === selected.id)).slice(0, 5)
    : [];
  const dogCount = id => dogs.filter(dog => dog.pet_parent_id === id).length;
  const serviceName = id => services.find(service => service.id === id)?.name || 'Stay';
  const closeDialog = () => setDialog(null);

  const confirmRemove = async () => {
    const isDog = removeKind === 'dog';
    setRemoveBusy(true);
    setRemoveError(null);
    const res = isDog
      ? await deleteDog(token, removing.id)
      : await deletePetParent(token, removing.id);
    setRemoveBusy(false);
    if (!res.ok && res.status !== 204) {
      setRemoveError(
        formatApiErrors(res.data).summary ||
          (isDog ? 'Could not delete that dog.' : 'Could not delete that household.'),
      );
      return;
    }
    const name = isDog ? removing.name : householdLabel(removing);
    setRemoving(null);
    if (!isDog) setSelectedId(null);
    await reload();
    notify(`${name} deleted.`);
  };

  const showList = wide || selected == null;
  const showDetail = selected != null;

  return (
    <Box role="tabpanel" id="desk-households-panel" aria-labelledby="desk-households-tab">
      <DeskSectionHeader
        id="staff-households-heading"
        title="Households"
        description="Families, their contact details, dogs and vaccines."
        action={
          <NewButton
            startIcon={<AddRoundedIcon />}
            onClick={() => setDialog({ kind: 'household' })}
          >
            New household
          </NewButton>
        }
      />

      {loading ? <SkeletonRows count={3} height={64} /> : null}

      {!loading && parents.length === 0 ? (
        <EmptyState
          icon={<HomeOutlinedIcon />}
          title="No households yet"
          body="Create a household for each family, then add their dogs."
        />
      ) : null}

      {!loading && parents.length > 0 ? (
        <Box
          sx={{
            mt: 2.5,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'flex-start' },
            gap: { xs: 2.5, lg: 3 },
          }}
        >
          {showList ? (
            <Box
              sx={{
                flex: { md: '0 1 340px' },
                minWidth: { xs: 0, md: 260 },
                position: { md: 'sticky' },
                top: { md: 0 },
              }}
            >
              <TextField
                fullWidth
                size="small"
                placeholder="Search name, email, phone or dog"
                value={query}
                onChange={event => setQuery(event.target.value)}
                InputProps={{
                  inputProps: { 'aria-label': 'Search households' },
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 999 },
                }}
              />
              {filtered.length === 0 ? (
                <Typography sx={{ mt: 2, color: 'text.secondary', fontSize: 14 }}>
                  No households match “{query}”.
                </Typography>
              ) : null}
              <Box
                component="ul"
                aria-label="Households"
                sx={{ listStyle: 'none', p: 0, m: 0, mt: 1.5, ...stackSx(0.75) }}
              >
                {filtered.map(parent => {
                  const active = parent.id === selectedId;
                  const count = dogCount(parent.id);
                  return (
                    <li key={parent.id}>
                      <ButtonBase
                        onClick={() => setSelectedId(parent.id)}
                        aria-label={`Open ${householdLabel(parent)}`}
                        aria-current={active ? 'true' : undefined}
                        sx={t => ({
                          display: 'flex',
                          width: '100%',
                          minWidth: 0,
                          justifyContent: 'flex-start',
                          textAlign: 'left',
                          gap: 1.5,
                          p: 1.25,
                          borderRadius: '14px',
                          border: '1px solid',
                          borderColor: active ? alpha(WEBSITE_ACCENT, 0.6) : 'transparent',
                          bgcolor: active ? alpha(WEBSITE_ACCENT, 0.12) : 'transparent',
                          '&:hover': {
                            bgcolor: active ? alpha(WEBSITE_ACCENT, 0.16) : hairline(t, 0.06),
                          },
                          '&.Mui-focusVisible': { outline: `2px solid ${WEBSITE_ACCENT}` },
                        })}
                      >
                        <HouseholdAvatar parent={parent} token={token} size={36} />
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography noWrap sx={{ fontWeight: 600, fontSize: 15 }}>
                            {householdLabel(parent)}
                          </Typography>
                          <Typography noWrap sx={{ color: 'text.secondary', fontSize: 13 }}>
                            {parent.email}
                          </Typography>
                        </Box>
                        <Typography
                          sx={{
                            flexShrink: 0,
                            color: 'text.secondary',
                            fontSize: 13,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {count} {count === 1 ? 'dog' : 'dogs'}
                        </Typography>
                      </ButtonBase>
                    </li>
                  );
                })}
              </Box>
            </Box>
          ) : null}

          {showDetail ? (
            <Box sx={{ flex: '1 1 0', minWidth: 0, ...stackSx(2) }}>
              {!wide ? (
                <Button
                  onClick={() => setSelectedId(null)}
                  startIcon={<ArrowBackRoundedIcon />}
                  sx={{
                    alignSelf: 'flex-start',
                    textTransform: 'none',
                    fontWeight: 600,
                    color: 'text.secondary',
                  }}
                >
                  All households
                </Button>
              ) : null}

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <ActionMenu
                  label={`Actions for ${householdLabel(selected)}`}
                  items={[
                    {
                      id: 'book',
                      label: 'Book a stay',
                      onClick: () => setDialog({ kind: 'stay' }),
                    },
                    {
                      id: 'delete',
                      label: 'Delete',
                      danger: true,
                      onClick: () => {
                        setRemoveError(null);
                        setRemoveKind('household');
                        setRemoveName(householdLabel(selected));
                        setRemoving(selected);
                      },
                    },
                  ]}
                />
              </Box>

              <ClientProfileView
                key={selected.id}
                embedded
                petParent={selected}
                token={token}
                onSaveProfile={form => updatePetParent(token, selected.id, form)}
                onProfileSaved={async () => {
                  await reload();
                  notify(`${householdLabel(selected)} saved.`);
                }}
                onUploadPhoto={async file => {
                  const res = await uploadPetParentPhoto(token, selected.id, file);
                  if (res.ok) {
                    notify(`${householdLabel(selected)} photo saved.`);
                    await reload();
                  }
                  return res;
                }}
                onRemovePhoto={async () => {
                  const res = await deletePetParentPhoto(token, selected.id);
                  if (res.ok || res.status === 204) {
                    notify(`${householdLabel(selected)} photo removed.`);
                    await reload();
                  }
                  return res;
                }}
                dogs={selectedDogs}
                dogsLoading={false}
                onCreateDog={payload =>
                  createDog(token, { ...payload, pet_parent_id: selected.id })
                }
                onDogsChanged={reload}
                onDogCreated={dog => notify(`${dog?.name || 'Dog'} added.`)}
                onRequestRemoveDog={record => {
                  setRemoveError(null);
                  setRemoveKind('dog');
                  setRemoveName(record.name);
                  setRemoving(record);
                }}
                onNotify={notify}
                below={
                  <Box>
                    <Typography
                      component="h2"
                      sx={{ fontWeight: 650, fontSize: 20, color: WEBSITE_INK }}
                    >
                      Recent stays
                    </Typography>
                    {selectedStays.length === 0 ? (
                      <Typography sx={{ mt: 1, color: alpha(WEBSITE_INK, 0.6), fontSize: 14 }}>
                        No stays yet.
                      </Typography>
                    ) : (
                      <Box
                        component="ul"
                        sx={{ listStyle: 'none', p: 0, m: 0, mt: 1, ...stackSx(0) }}
                      >
                        {selectedStays.map(stay => (
                          <Box
                            component="li"
                            key={stay.id}
                            sx={{
                              py: 1.25,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              flexWrap: 'wrap',
                              borderBottom: '1px solid',
                              borderColor: hairline(theme, 0.08),
                            }}
                          >
                            <Typography
                              sx={{
                                fontWeight: 600,
                                fontSize: 14,
                                flex: '0 0 170px',
                                color: WEBSITE_INK,
                              }}
                            >
                              {formatDateRange(stay.starts_on, stay.ends_on)}
                            </Typography>
                            <Typography
                              sx={{
                                color: alpha(WEBSITE_INK, 0.65),
                                fontSize: 14,
                                flex: '1 1 120px',
                                minWidth: 0,
                              }}
                            >
                              {serviceName(stay.service_id)}
                            </Typography>
                            <StatusChip status={stay.status} />
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                }
              />
            </Box>
          ) : null}
        </Box>
      ) : null}

      <HouseholdDialog
        open={dialog?.kind === 'household'}
        household={dialog?.kind === 'household' ? dialog.record : undefined}
        onClose={closeDialog}
        onSave={body =>
          dialog?.record
            ? updatePetParent(token, dialog.record.id, body)
            : createPetParent(token, body)
        }
        onSaved={async saved => {
          const isNew = !dialog?.record;
          closeDialog();
          await reload();
          if (saved?.id) setSelectedId(saved.id);
          setQuery('');
          notify(isNew ? `${householdLabel(saved)} added.` : 'Household saved.');
        }}
      />
      <DogDialog
        open={dialog?.kind === 'dog'}
        dog={dialog?.kind === 'dog' ? dialog.record : undefined}
        householdName={selected ? householdLabel(selected) : undefined}
        onClose={closeDialog}
        onSave={body =>
          dialog?.record
            ? updateDog(token, dialog.record.id, body)
            : createDog(token, { ...body, pet_parent_id: selected.id })
        }
        onSaved={async saved => {
          const isNew = !dialog?.record;
          closeDialog();
          await reload();
          notify(isNew ? `${saved?.name || 'Dog'} added.` : `${saved?.name || 'Dog'} saved.`);
        }}
      />
      <ConfirmDialog
        open={Boolean(removing)}
        title={`Delete ${removeName || (removeKind === 'dog' ? 'dog' : 'household')}?`}
        body={
          removeKind === 'dog'
            ? 'This removes the dog and their vaccines. Stays that include them will no longer list this dog.'
            : 'This removes their login, dogs, and stays.'
        }
        confirmLabel={removeKind === 'dog' ? 'Delete dog' : 'Delete household'}
        busy={removeBusy}
        error={removeError}
        onClose={() => setRemoving(null)}
        onConfirm={confirmRemove}
      />
      <StayDialog
        open={dialog?.kind === 'stay'}
        parents={parents}
        dogs={dogs}
        services={services}
        presetParentId={selected?.id}
        onClose={closeDialog}
        onSave={body => createBooking(token, body)}
        onSaved={async () => {
          closeDialog();
          await reload();
          notify('Stay created and confirmed.');
        }}
      />
    </Box>
  );
}

DeskHouseholdsTab.propTypes = {
  data: PropTypes.object.isRequired,
  notify: PropTypes.func.isRequired,
};
