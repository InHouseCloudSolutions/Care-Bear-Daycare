'use client';

import { useEffect, useId, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { alpha } from '@mui/material/styles';
import { WEBSITE_INK } from '@/consts/website-theme';
import {
  deleteDog,
  deleteDogPhoto,
  formatApiErrors,
  updateDog,
  uploadDogPhoto,
} from '@/lib/daycareApi';
import { CARD_SX, CREAM_FIELDS_SX } from './pet-parent-styles';
import DogForm from './DogForm';
import DogVaccines from './DogVaccines';
import ProfilePhoto from './ProfilePhoto';

function photoErrorMessage(res, fallback) {
  const { summary, fields } = formatApiErrors(res.data);
  return fields.file || summary || fallback;
}

function dogDetails(dog) {
  const sex =
    dog.sex && dog.sex !== 'unknown' ? dog.sex.charAt(0).toUpperCase() + dog.sex.slice(1) : '';
  return [dog.breed, sex].filter(Boolean).join(' · ') || 'No details yet';
}

/** One dog: photo, full profile editor, and vaccine records. */
export default function DogCard({ dog, token, onChanged, onRequestRemove, onNotify }) {
  const menuId = useId();
  const photoRef = useRef(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(dog.photo_url ?? null);
  const menuOpen = Boolean(menuAnchor);

  useEffect(() => {
    setPhotoUrl(dog.photo_url ?? null);
  }, [dog.photo_url]);

  const closeMenu = () => setMenuAnchor(null);

  const handleUpdate = async payload => {
    const res = await updateDog(token, dog.id, payload);
    if (res.ok) {
      setEditing(false);
      if (onChanged) await onChanged();
      onNotify?.(`${dog.name} saved.`);
    }
    return res;
  };

  const handlePhotoUpload = async file => {
    const res = await uploadDogPhoto(token, dog.id, file);
    if (!res.ok) {
      return photoErrorMessage(res, 'Could not upload that photo.');
    }
    setPhotoUrl(res.data?.photo_url ?? null);
    if (onChanged) await onChanged();
    onNotify?.(`${dog.name} photo saved.`);
    return null;
  };

  const handlePhotoRemove = async () => {
    const res = await deleteDogPhoto(token, dog.id);
    if (!res.ok) {
      return photoErrorMessage(res, 'Could not remove that photo.');
    }
    setPhotoUrl(null);
    if (onChanged) await onChanged();
    onNotify?.(`${dog.name} photo removed.`);
    return null;
  };

  const handleDelete = async () => {
    setDeleting(true);
    const res = await deleteDog(token, dog.id);
    setDeleting(false);
    if (res.ok || res.status === 204) {
      onChanged();
    } else {
      setConfirmingDelete(false);
    }
  };

  const requestRemove = () => {
    if (onRequestRemove) onRequestRemove(dog);
    else setConfirmingDelete(true);
  };

  const menuItems = [
    { id: 'edit', label: 'Edit profile', onClick: () => setEditing(true) },
    { id: 'photo', label: 'Change photo', onClick: () => photoRef.current?.openFilePicker() },
    ...(photoUrl
      ? [{ id: 'remove-photo', label: 'Remove photo', onClick: () => photoRef.current?.remove() }]
      : []),
    { id: 'remove', label: 'Remove', danger: true, onClick: requestRemove },
  ];

  return (
    <Box sx={{ ...CARD_SX, height: '100%', ...CREAM_FIELDS_SX }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <ProfilePhoto
          ref={photoRef}
          variant="dog"
          photoUrl={photoUrl}
          token={token}
          name={dog.name}
          showControls={false}
          onUpload={handlePhotoUpload}
          onRemove={handlePhotoRemove}
        />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                component="h3"
                sx={{ fontWeight: 700, fontSize: 18, color: WEBSITE_INK, lineHeight: 1.2 }}
              >
                {dog.name}
              </Typography>
              <Typography sx={{ mt: 0.35, fontSize: 13.5, color: alpha(WEBSITE_INK, 0.55) }}>
                {dogDetails(dog)}
              </Typography>
            </Box>
            <IconButton
              type="button"
              aria-label={`Actions for ${dog.name}`}
              aria-haspopup="menu"
              aria-controls={menuOpen ? menuId : undefined}
              aria-expanded={menuOpen ? 'true' : undefined}
              onClick={event => setMenuAnchor(event.currentTarget)}
              sx={{
                width: 36,
                height: 36,
                color: WEBSITE_INK,
                border: `1px solid ${alpha(WEBSITE_INK, 0.14)}`,
                borderRadius: '10px',
              }}
            >
              <MoreHorizIcon />
            </IconButton>
            <Menu
              id={menuId}
              anchorEl={menuAnchor}
              open={menuOpen}
              onClose={closeMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              {menuItems.map(item => (
                <MenuItem
                  key={item.id}
                  onClick={() => {
                    closeMenu();
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
          </Box>
          <Button
            type="button"
            onClick={() => setEditing(true)}
            startIcon={<EditOutlinedIcon sx={{ fontSize: 16 }} />}
            sx={{
              mt: 1,
              px: 0,
              minWidth: 0,
              textTransform: 'none',
              textDecoration: 'underline',
              color: WEBSITE_INK,
              fontWeight: 650,
              fontSize: 14,
            }}
          >
            Edit profile
          </Button>
        </Box>
      </Box>

      {editing ? (
        <Box sx={{ mt: 2 }}>
          <DogForm
            initialDog={dog}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(false)}
            submitLabel="Save dog"
          />
        </Box>
      ) : null}

      {confirmingDelete ? (
        <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
          <Button
            type="button"
            size="small"
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={deleting}
            sx={{ textTransform: 'none', boxShadow: 'none' }}
          >
            {deleting ? 'Removing…' : 'Confirm remove'}
          </Button>
          <Button
            type="button"
            size="small"
            onClick={() => setConfirmingDelete(false)}
            disabled={deleting}
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
        </Box>
      ) : null}

      <DogVaccines dogId={dog.id} token={token} dogName={dog.name} onNotify={onNotify} />
    </Box>
  );
}

DogCard.propTypes = {
  dog: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    breed: PropTypes.string,
    sex: PropTypes.string,
    photo_url: PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf([null])]),
  }).isRequired,
  token: PropTypes.string,
  onChanged: PropTypes.func.isRequired,
  onRequestRemove: PropTypes.func,
  onNotify: PropTypes.func,
};
