'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@mui/material';
import DogHotelInteriorPage from '@/components/dog-hotel/DogHotelInteriorPage';
import { useAuth } from '@/contexts/AuthContext';
import { BOOK_STAY_PATH, STAFF_PREFIX } from '@/consts/routes';
import { WEBSITE_ACCENT } from '@/consts/website-theme';
import {
  createDog,
  deleteMyPhoto,
  listDogs,
  updateMyProfile,
  uploadMyPhoto,
} from '@/lib/daycareApi';
import ClientProfileView from './ClientProfileView';
import { PRIMARY_BUTTON_SX, SECONDARY_BUTTON_SX } from './pet-parent-styles';

function dogsForParent(dogs, petParentId) {
  if (petParentId == null) return dogs;
  const tagged = dogs.some(dog => dog.pet_parent_id != null);
  if (!tagged) return dogs;
  return dogs.filter(dog => dog.pet_parent_id === petParentId);
}

const BOOK_BUTTON_SX = {
  ...PRIMARY_BUTTON_SX,
  bgcolor: WEBSITE_ACCENT,
  color: '#fff',
  alignSelf: 'auto',
  '&:hover': { bgcolor: '#C4813A', boxShadow: 'none' },
};

export default function AccountProfilePage() {
  const { user, petParent, token, loading, logout, refreshAuth } = useAuth();
  const isStaff = user?.isStaff === true;
  const [dogs, setDogs] = useState([]);
  const [dogsLoading, setDogsLoading] = useState(Boolean(token) && !isStaff);
  const [dogsError, setDogsError] = useState(null);
  const missing = !loading && Boolean(user) && !petParent && !isStaff;

  const loadDogs = useCallback(async () => {
    if (!token || isStaff) {
      setDogs([]);
      setDogsLoading(false);
      return;
    }
    setDogsLoading(true);
    const res = await listDogs(token);
    setDogsLoading(false);
    if (!res.ok) {
      setDogsError('Could not load your dogs.');
      return;
    }
    setDogsError(null);
    const rows = Array.isArray(res.data) ? res.data : [];
    setDogs(dogsForParent(rows, petParent?.id));
  }, [token, petParent?.id, isStaff]);

  useEffect(() => {
    loadDogs();
  }, [loadDogs]);

  return (
    <DogHotelInteriorPage suppressHeading title="Your account" frameMaxWidth={1080}>
      <ClientProfileView
        showPageHeader
        actions={
          <>
            {isStaff ? (
              <Button component={Link} href={STAFF_PREFIX} variant="contained" sx={BOOK_BUTTON_SX}>
                Staff portal
              </Button>
            ) : (
              <Button component={Link} href={BOOK_STAY_PATH} variant="contained" sx={BOOK_BUTTON_SX}>
                Book a stay →
              </Button>
            )}
            <Button type="button" variant="outlined" onClick={logout} sx={SECONDARY_BUTTON_SX}>
              Log out
            </Button>
          </>
        }
        petParent={missing ? null : petParent}
        missingProfile={missing}
        signedInName={user?.username || ''}
        token={token}
        onSaveProfile={form => updateMyProfile(token, form)}
        onProfileSaved={refreshAuth}
        onUploadPhoto={file => uploadMyPhoto(token, file)}
        onRemovePhoto={() => deleteMyPhoto(token)}
        dogs={dogs}
        dogsLoading={dogsLoading}
        dogsError={dogsError}
        onCreateDog={petParent && !isStaff ? payload => createDog(token, payload) : undefined}
        onDogsChanged={loadDogs}
        showHousehold={!isStaff}
      />
    </DogHotelInteriorPage>
  );
}
