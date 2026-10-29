'use client';

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Button } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { WEBSITE_INK } from '@/consts/website-theme';
import {
  deleteDog,
  deleteDogPhoto,
  formatApiErrors,
  updateDog,
  uploadDogPhoto,
} from '@/lib/daycareApi';
import { CARD_SX } from './pet-parent-styles';
import DogForm from './DogForm';
import DogVaccines from './DogVaccines';
import ProfilePhoto from './ProfilePhoto';

function photoErrorMessage(res, fallback) {
  const { summary, fields } = formatApiErrors(res.data);
  return fields.file || summary || fallback;
}

/** One dog: view/edit summary, photo, delete, and its nested vaccine list. */
export default function DogCard({ dog, token, onChanged }) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(dog.photo_url ?? null);

  useEffect(() => {
    setPhotoUrl(dog.photo_url ?? null);
  }, [dog.photo_url]);

  const handleUpdate = async payload => {
    const res = await updateDog(token, dog.id, payload);
    if (res.ok) {
      setEditing(false);
      onChanged();
    }
    return res;
  };

  const handlePhotoUpload = async file => {
    const res = await uploadDogPhoto(token, dog.id, file);
    if (!res.ok) {
      return photoErrorMessage(res, 'Could not upload that photo.');
    }
    setPhotoUrl(res.data?.photo_url ?? null);
    onChanged();
    return null;
  };

  const handlePhotoRemove = async () => {
    const res = await deleteDogPhoto(token, dog.id);
    if (!res.ok) {
      return photoErrorMessage(res, 'Could not remove that photo.');
    }
    setPhotoUrl(null);
    onChanged();
    return null;
  };

  const details = [dog.breed, dog.sex].filter(Boolean).join(' · ') || 'No details yet';

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

  return (
    <Box sx={CARD_SX}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <ProfilePhoto
          photoUrl={photoUrl}
          token={token}
          name={dog.name}
          title={editing ? undefined : dog.name}
          subtitle={editing ? undefined : details}
          onUpload={handlePhotoUpload}
          onRemove={handlePhotoRemove}
        />
        {!editing ? (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" onClick={() => setEditing(true)} sx={{ textTransform: 'none' }}>
              Edit
            </Button>
            {confirmingDelete ? (
              <>
                <Button
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
                  size="small"
                  onClick={() => setConfirmingDelete(false)}
                  disabled={deleting}
                  sx={{ textTransform: 'none' }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                size="small"
                color="error"
                onClick={() => setConfirmingDelete(true)}
                sx={{ textTransform: 'none' }}
              >
                Remove
              </Button>
            )}
          </Box>
        ) : null}
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
      <Box sx={{ mt: 3, pt: 3, borderTop: `1px solid ${alpha(WEBSITE_INK, 0.1)}` }}>
        <DogVaccines dogId={dog.id} token={token} />
      </Box>
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
};
