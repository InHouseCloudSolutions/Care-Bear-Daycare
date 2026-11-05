'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
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
import PetsRoundedIcon from '@mui/icons-material/PetsRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ProfilePhoto, { useDaycarePhoto } from '@/components/pet-parent/ProfilePhoto';
import { WEBSITE_ACCENT, WEBSITE_INK } from '@/consts/website-theme';
import {
  createBooking,
  createDog,
  createPetParent,
  deleteDog,
  deleteDogPhoto,
  deletePetParent,
  deletePetParentPhoto,
  formatApiErrors,
  updateDog,
  updatePetParent,
  uploadDogPhoto,
  uploadPetParentPhoto,
} from '@/lib/daycareApi';
import {
  ConfirmDialog,
  DeskSectionHeader,
  EmptyState,
  GroupLabel,
  NewButton,
  RecordCard,
  RowButton,
  SkeletonRows,
  StatusChip,
  ToneChip,
  flowSx,
  stackSx,
} from './DeskParts';
import { DogDialog, HouseholdDialog, StayDialog } from './DeskDialogs';
import DeskDogVaccines from './DeskDogVaccines';
import {
  dogSummary,
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

function Detail({ label, children }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <GroupLabel>{label}</GroupLabel>
      <Typography sx={{ mt: 0.5, fontSize: 15, overflowWrap: 'anywhere' }}>
        {children || (
          <Box component="span" sx={{ color: 'text.secondary' }}>
            Not set
          </Box>
        )}
      </Typography>
    </Box>
  );
}

Detail.propTypes = { label: PropTypes.string.isRequired, children: PropTypes.node };

function photoErrorMessage(res, fallback) {
  const { summary, fields } = formatApiErrors(res.data);
  return fields.file || summary || fallback;
}

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

function DogCard({ dog, token, notify, onEdit, onDelete, onChanged }) {
  const photoRef = useRef(null);
  const [photoUrl, setPhotoUrl] = useState(dog.photo_url ?? null);
  const [addingVaccine, setAddingVaccine] = useState(false);

  useEffect(() => {
    setPhotoUrl(dog.photo_url ?? null);
  }, [dog.photo_url]);

  const handlePhotoUpload = async file => {
    const res = await uploadDogPhoto(token, dog.id, file);
    if (!res.ok) return photoErrorMessage(res, 'Could not upload that photo.');
    setPhotoUrl(res.data?.photo_url ?? null);
    await onChanged();
    notify(`${dog.name} photo saved.`);
    return null;
  };

  const handlePhotoRemove = async () => {
    const res = await deleteDogPhoto(token, dog.id);
    if (!res.ok) return photoErrorMessage(res, 'Could not remove that photo.');
    setPhotoUrl(null);
    await onChanged();
    notify(`${dog.name} photo removed.`);
    return null;
  };

  return (
    <RecordCard sx={{ p: { xs: 2, md: 2.25 } }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <ProfilePhoto
            ref={photoRef}
            photoUrl={photoUrl}
            token={token}
            name={dog.name}
            title={dog.name}
            subtitle={dogSummary(dog)}
            showControls={false}
            onUpload={handlePhotoUpload}
            onRemove={handlePhotoRemove}
          />
          <Box sx={{ mt: 1, display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
            <ToneChip
              label={dog.good_with_dogs ? 'Good with dogs' : 'Not good with dogs'}
              tone={dog.good_with_dogs ? 'positive' : 'danger'}
            />
            {dog.spayed_neutered ? <ToneChip label="Fixed" tone="muted" /> : null}
            {dog.medications ? <ToneChip label="On medication" tone="accent" /> : null}
          </Box>
        </Box>
        <ActionMenu
          label={`Actions for ${dog.name}`}
          items={[
            { id: 'edit', label: 'Edit', onClick: onEdit },
            {
              id: 'photo',
              label: photoUrl ? 'Replace photo' : 'Add photo',
              onClick: () => photoRef.current?.openFilePicker(),
            },
            ...(photoUrl
              ? [
                  {
                    id: 'remove-photo',
                    label: 'Remove photo',
                    danger: true,
                    onClick: () => photoRef.current?.remove(),
                  },
                ]
              : []),
            { id: 'vaccine', label: 'Add vaccine', onClick: () => setAddingVaccine(true) },
            { id: 'delete', label: 'Delete', danger: true, onClick: () => onDelete(dog) },
          ]}
        />
      </Box>
      <Box sx={{ pt: 1.5 }}>
        <DeskDogVaccines
          dog={dog}
          token={token}
          notify={notify}
          adding={addingVaccine}
          onAddingChange={setAddingVaccine}
        />
      </Box>
    </RecordCard>
  );
}

DogCard.propTypes = {
  dog: PropTypes.object.isRequired,
  token: PropTypes.string,
  notify: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onChanged: PropTypes.func.isRequired,
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
  const householdPhotoRef = useRef(null);

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
            <Box sx={{ flex: '1 1 0', minWidth: 0, ...stackSx(2.5) }}>
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

              <RecordCard aria-label={`Household ${householdLabel(selected)}`}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ minWidth: 0, flex: '1 1 240px' }}>
                    <ProfilePhoto
                      ref={householdPhotoRef}
                      photoUrl={selected.photo_url ?? null}
                      token={token}
                      name={householdLabel(selected)}
                      title={householdLabel(selected)}
                      subtitle={selected.email}
                      showControls={false}
                      onUpload={async file => {
                        const res = await uploadPetParentPhoto(token, selected.id, file);
                        if (!res.ok) {
                          return photoErrorMessage(res, 'Could not upload that photo.');
                        }
                        await reload();
                        notify(`${householdLabel(selected)} photo saved.`);
                        return null;
                      }}
                      onRemove={async () => {
                        const res = await deletePetParentPhoto(token, selected.id);
                        if (!res.ok) {
                          return photoErrorMessage(res, 'Could not remove that photo.');
                        }
                        await reload();
                        notify(`${householdLabel(selected)} photo removed.`);
                        return null;
                      }}
                    />
                  </Box>
                  <ActionMenu
                    label={`Actions for ${householdLabel(selected)}`}
                    items={[
                      {
                        id: 'edit',
                        label: 'Edit',
                        onClick: () => setDialog({ kind: 'household', record: selected }),
                      },
                      {
                        id: 'photo',
                        label: selected.photo_url ? 'Replace photo' : 'Add photo',
                        onClick: () => householdPhotoRef.current?.openFilePicker(),
                      },
                      ...(selected.photo_url
                        ? [
                            {
                              id: 'remove-photo',
                              label: 'Remove photo',
                              danger: true,
                              onClick: () => householdPhotoRef.current?.remove(),
                            },
                          ]
                        : []),
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
                <Box
                  sx={{
                    mt: 2.5,
                    pt: 2.5,
                    borderTop: '1px solid',
                    borderColor: hairline(theme, 0.1),
                    ...flowSx('180px', 2),
                  }}
                >
                  <Detail label="Phone">{selected.phone}</Detail>
                  <Detail label="Address">
                    {[selected.address, selected.city].filter(Boolean).join(', ')}
                  </Detail>
                  <Detail label="Emergency contact">
                    {[selected.emergency_name, selected.emergency_phone]
                      .filter(Boolean)
                      .join(' · ')}
                  </Detail>
                </Box>
              </RecordCard>

              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  <Typography component="h3" sx={{ fontWeight: 600, fontSize: 17 }}>
                    Dogs
                  </Typography>
                  <RowButton
                    startIcon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
                    onClick={() => setDialog({ kind: 'dog' })}
                  >
                    Add a dog
                  </RowButton>
                </Box>
                {selectedDogs.length === 0 ? (
                  <EmptyState
                    icon={<PetsRoundedIcon />}
                    title="No dogs yet"
                    body="Add this family’s dogs so you can book stays for them."
                  />
                ) : (
                  <Box
                    sx={{
                      mt: 1.5,
                      ...flowSx('300px', 1.5),
                      alignItems: 'flex-start',
                    }}
                  >
                    {selectedDogs.map(dog => (
                      <DogCard
                        key={dog.id}
                        dog={dog}
                        token={token}
                        notify={notify}
                        onChanged={reload}
                        onEdit={() => setDialog({ kind: 'dog', record: dog })}
                        onDelete={record => {
                          setRemoveError(null);
                          setRemoveKind('dog');
                          setRemoveName(record.name);
                          setRemoving(record);
                        }}
                      />
                    ))}
                  </Box>
                )}
              </Box>

              <Box>
                <Typography component="h3" sx={{ fontWeight: 600, fontSize: 17 }}>
                  Stays
                </Typography>
                {selectedStays.length === 0 ? (
                  <Typography sx={{ mt: 1, color: 'text.secondary', fontSize: 14 }}>
                    No stays yet.
                  </Typography>
                ) : (
                  <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, mt: 1, ...stackSx(0) }}>
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
                        <Typography sx={{ fontWeight: 600, fontSize: 14, flex: '0 0 170px' }}>
                          {formatDateRange(stay.starts_on, stay.ends_on)}
                        </Typography>
                        <Typography
                          sx={{
                            color: 'text.secondary',
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
