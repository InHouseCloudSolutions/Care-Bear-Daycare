'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { WEBSITE_INK } from '@/consts/website-theme';
import { deleteDog, updateDog } from '@/lib/daycareApi';
import { CARD_SX } from './pet-parent-styles';
import DogForm from './DogForm';
import DogVaccines from './DogVaccines';

/** One dog: view/edit summary, delete, and its nested vaccine list. */
export default function DogCard({ dog, token, onChanged }) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleUpdate = async payload => {
    const res = await updateDog(token, dog.id, payload);
    if (res.ok) {
      setEditing(false);
      onChanged();
    }
    return res;
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

  return (
    <Box sx={CARD_SX}>
      {editing ? (
        <DogForm
          initialDog={dog}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
          submitLabel="Save dog"
        />
      ) : (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box>
            <Typography
              component="h3"
              sx={{ fontSize: '1.125rem', fontWeight: 600, color: WEBSITE_INK }}
            >
              {dog.name}
            </Typography>
            <Typography
              component="p"
              sx={{ mt: 0.5, color: alpha(WEBSITE_INK, 0.7), fontSize: 14 }}
            >
              {[dog.breed, dog.sex].filter(Boolean).join(' · ') || 'No details yet'}
            </Typography>
          </Box>
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
        </Box>
      )}
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
  }).isRequired,
  token: PropTypes.string,
  onChanged: PropTypes.func.isRequired,
};
