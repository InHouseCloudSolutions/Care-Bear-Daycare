'use client';

import { useId, useState } from 'react';
import PropTypes from 'prop-types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import CachedIcon from '@mui/icons-material/Cached';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import ZoomInOutlinedIcon from '@mui/icons-material/ZoomInOutlined';
import {
  Box,
  Chip,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Skeleton,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { WEBSITE_ACCENT, WEBSITE_HEART } from '@/consts/website-theme';
import { daycareImageSrc } from '@/lib/daycareApi';
import { SITE_IMAGE_ACCEPT } from './site-images';
import { cardIconSx, cardSx, hairline, visuallyHiddenInputSx } from './site-image-styles';

export const rowShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  alt: PropTypes.string,
  image_url: PropTypes.string,
  sort_order: PropTypes.number,
});

export function trimmedAlt(row) {
  return typeof row?.alt === 'string' ? row.alt.trim() : '';
}

/** Name used in button labels: the alt text, or "image 3". */
export function imageLabel(row, index) {
  return trimmedAlt(row) || `image ${index + 1}`;
}

export function displayTitle(row, index) {
  return trimmedAlt(row) || `Photo ${index + 1}`;
}

export function mediaAspect(placement) {
  return placement === 'home_slide' ? '16 / 9' : '4 / 3';
}

/**
 * A label that is also a drop target for one image file.
 * The real file input stays focusable (visually hidden) so keyboard users can open it.
 */
export function PhotoDropzone({ inputLabel, disabled, onFile, children, sx }) {
  const [over, setOver] = useState(false);

  const stop = event => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <Box
      component="label"
      onDragEnter={event => {
        stop(event);
        if (!disabled) setOver(true);
      }}
      onDragOver={stop}
      onDragLeave={event => {
        stop(event);
        if (!event.currentTarget.contains(event.relatedTarget)) setOver(false);
      }}
      onDrop={event => {
        stop(event);
        setOver(false);
        if (disabled) return;
        const file = event.dataTransfer?.files?.[0];
        if (file) onFile(file);
      }}
      sx={[
        theme => ({
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 1,
          borderRadius: '16px',
          border: '1.5px dashed',
          borderColor: over ? WEBSITE_ACCENT : hairline(theme, 0.28),
          bgcolor: over
            ? alpha(WEBSITE_ACCENT, 0.12)
            : theme.palette.background.muted || 'action.hover',
          cursor: disabled ? 'default' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          transition: 'border-color 140ms ease, background-color 140ms ease',
          '&:hover': disabled ? {} : { borderColor: WEBSITE_ACCENT },
          '&:focus-within': { outline: `2px solid ${WEBSITE_ACCENT}`, outlineOffset: 2 },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
      <Box
        component="input"
        type="file"
        accept={SITE_IMAGE_ACCEPT}
        aria-label={inputLabel}
        disabled={disabled}
        onChange={event => {
          const file = event.target.files?.[0] || null;
          event.target.value = '';
          if (file) onFile(file);
        }}
        sx={visuallyHiddenInputSx}
      />
    </Box>
  );
}

PhotoDropzone.propTypes = {
  inputLabel: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  onFile: PropTypes.func.isRequired,
  children: PropTypes.node,
  sx: PropTypes.oneOfType([PropTypes.object, PropTypes.func, PropTypes.array]),
};

export function DropzoneCopy({ compact = false }) {
  return (
    <>
      <Box
        aria-hidden
        sx={{
          width: compact ? 44 : 56,
          height: compact ? 44 : 56,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: alpha(WEBSITE_ACCENT, 0.18),
          color: WEBSITE_ACCENT,
        }}
      >
        <AddPhotoAlternateOutlinedIcon sx={{ fontSize: compact ? 24 : 28 }} />
      </Box>
      <Typography sx={{ fontWeight: 700, fontSize: compact ? 14 : 16 }}>
        Drop a photo here or{' '}
        <Box component="span" sx={{ color: WEBSITE_ACCENT, textDecoration: 'underline' }}>
          browse
        </Box>
      </Typography>
      <Typography sx={{ color: 'text.secondary', fontSize: 12.5 }}>
        JPEG, PNG, WEBP or GIF · big photos are resized for the web automatically
      </Typography>
    </>
  );
}

DropzoneCopy.propTypes = { compact: PropTypes.bool };

const NEEDS_ALT_FILL = '#E06B45';
const GRIP_DOTS = [0, 1, 2, 3, 4, 5];

function GripDots() {
  return (
    <Box
      aria-hidden
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 4px)',
        gap: '3px',
      }}
    >
      {GRIP_DOTS.map(dot => (
        <Box key={dot} sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'currentColor' }} />
      ))}
    </Box>
  );
}

function menuItemSx(color) {
  return {
    gap: 1.25,
    minHeight: 42,
    py: 1,
    fontWeight: 600,
    fontSize: 15,
    color: color || 'text.primary',
  };
}

export function SiteImageCard({
  row,
  index,
  placement,
  disabled,
  highlighted,
  onView,
  onEdit,
  onReplace,
  onRemove,
}) {
  const menuId = useId();
  const [menuAnchor, setMenuAnchor] = useState(null);
  const menuOpen = Boolean(menuAnchor);
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id, disabled });
  const src = daycareImageSrc(row.image_url);
  const label = imageLabel(row, index);
  const title = displayTitle(row, index);
  const missingAlt = !trimmedAlt(row);

  const closeMenu = action => {
    setMenuAnchor(null);
    action();
  };

  return (
    <Box
      ref={setNodeRef}
      component="li"
      sx={[
        cardSx,
        {
          listStyle: 'none',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '18px',
          transform: CSS.Transform.toString(transform),
          transition: [transition, 'box-shadow 200ms ease, border-color 200ms ease']
            .filter(Boolean)
            .join(', '),
          position: 'relative',
          zIndex: isDragging ? 2 : 'auto',
          boxShadow: isDragging ? '0 18px 40px rgba(8, 46, 52, 0.28)' : 'none',
        },
        highlighted && {
          borderColor: WEBSITE_ACCENT,
          boxShadow: `0 0 0 3px ${alpha(WEBSITE_ACCENT, 0.35)}`,
        },
      ]}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          px: 1.25,
          pt: 1.25,
          pb: 0.25,
        }}
      >
        <IconButton
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={`Drag to reorder ${label}`}
          disabled={disabled}
          size="small"
          sx={{
            width: 32,
            height: 36,
            flexShrink: 0,
            color: 'text.secondary',
            borderRadius: '8px',
            cursor: isDragging ? 'grabbing' : 'grab',
            touchAction: 'none',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <GripDots />
        </IconButton>
        <Typography
          title={title}
          noWrap
          sx={{
            flex: 1,
            minWidth: 0,
            fontWeight: 600,
            fontSize: 16,
            lineHeight: 1.3,
            color: 'text.primary',
          }}
        >
          {title}
        </Typography>
        <IconButton
          aria-label={`Actions for ${label}`}
          aria-haspopup="menu"
          aria-controls={menuOpen ? menuId : undefined}
          aria-expanded={menuOpen ? 'true' : undefined}
          disabled={disabled}
          size="small"
          onClick={event => setMenuAnchor(event.currentTarget)}
          sx={theme => ({ ...cardIconSx(theme), flexShrink: 0 })}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
        <Menu
          id={menuId}
          anchorEl={menuAnchor}
          open={menuOpen}
          onClose={() => setMenuAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: theme => ({
              mt: 0.75,
              minWidth: 200,
              borderRadius: '12px',
              bgcolor: 'background.paper',
              backgroundImage: 'none',
              border: '1px solid',
              borderColor: hairline(theme, 0.16),
              boxShadow:
                theme.palette.mode === 'dark'
                  ? '0 18px 40px rgba(0, 0, 0, 0.4)'
                  : '0 12px 32px rgba(11, 60, 67, 0.12)',
            }),
          }}
        >
          <MenuItem
            aria-label={`Edit ${label}`}
            disabled={disabled}
            onClick={() => closeMenu(() => onEdit(row))}
            sx={menuItemSx()}
          >
            <ListItemIcon sx={{ minWidth: 28, color: 'inherit' }}>
              <EditOutlinedIcon fontSize="small" />
            </ListItemIcon>
            Edit
          </MenuItem>
          <MenuItem
            aria-label={`Replace image for ${label}`}
            disabled={disabled}
            onClick={() => closeMenu(() => onReplace(row))}
            sx={menuItemSx()}
          >
            <ListItemIcon sx={{ minWidth: 28, color: 'inherit' }}>
              <CachedIcon fontSize="small" />
            </ListItemIcon>
            Replace image
          </MenuItem>
          <Divider sx={theme => ({ borderColor: hairline(theme, 0.12), my: 0.5 })} />
          <MenuItem
            aria-label={`Delete ${label}`}
            disabled={disabled}
            onClick={() => closeMenu(() => onRemove(row))}
            sx={menuItemSx(WEBSITE_HEART)}
          >
            <ListItemIcon sx={{ minWidth: 28, color: WEBSITE_HEART }}>
              <DeleteOutlineIcon fontSize="small" />
            </ListItemIcon>
            Delete
          </MenuItem>
        </Menu>
      </Box>

      <Box sx={{ px: 1.5, pb: 1.5, pt: 1 }}>
        <Box
          sx={{
            position: 'relative',
            aspectRatio: mediaAspect(placement),
            borderRadius: '10px',
            overflow: 'hidden',
            bgcolor: 'action.hover',
          }}
        >
          {src ? (
            <Box
              component="button"
              type="button"
              onClick={() => onView(index)}
              aria-label={`View ${label} larger`}
              sx={{
                p: 0,
                m: 0,
                border: 0,
                display: 'block',
                width: '100%',
                height: '100%',
                cursor: 'zoom-in',
                background: 'none',
                '&:focus-visible': { outline: `2px solid ${WEBSITE_ACCENT}`, outlineOffset: -2 },
                '&:hover .zoom-hint, &:focus-visible .zoom-hint': { opacity: 1 },
              }}
            >
              <Box
                component="img"
                src={src}
                alt=""
                draggable={false}
                sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <Box
                className="zoom-hint"
                aria-hidden
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: alpha('#0E272C', 0.28),
                  color: '#FFFCF7',
                  opacity: 0,
                  transition: 'opacity 160ms ease',
                }}
              >
                <ZoomInOutlinedIcon />
              </Box>
            </Box>
          ) : (
            <Box sx={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Preview unavailable
              </Typography>
            </Box>
          )}
          {missingAlt ? (
            <Chip
              icon={<ReportProblemOutlinedIcon sx={{ fontSize: 16 }} />}
              label="Needs alt text"
              size="small"
              onClick={() => onEdit(row)}
              disabled={disabled}
              sx={{
                position: 'absolute',
                left: 10,
                bottom: 10,
                zIndex: 1,
                height: 28,
                borderRadius: 999,
                fontWeight: 700,
                fontSize: 13,
                color: '#FFFCF7',
                bgcolor: NEEDS_ALT_FILL,
                backdropFilter: 'none',
                '& .MuiChip-icon': { color: '#FFFCF7', ml: 0.75 },
                '&:hover': { bgcolor: '#D45E38' },
                '&.Mui-disabled': { opacity: 0.6, color: '#FFFCF7' },
              }}
            />
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}

SiteImageCard.propTypes = {
  row: rowShape.isRequired,
  index: PropTypes.number.isRequired,
  placement: PropTypes.oneOf(['home_slide', 'gallery']).isRequired,
  disabled: PropTypes.bool,
  highlighted: PropTypes.bool,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onReplace: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export function SiteImageGridSkeleton({ placement }) {
  return [0, 1, 2].map(key => (
    <Box
      key={key}
      component="li"
      sx={[cardSx, { listStyle: 'none', borderRadius: '18px', p: 1.5 }]}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.5 }}>
        <Skeleton variant="circular" width={18} height={18} />
        <Skeleton variant="text" sx={{ flex: 1, fontSize: 16 }} />
        <Skeleton variant="circular" width={32} height={32} />
      </Box>
      <Skeleton
        variant="rectangular"
        sx={{
          width: '100%',
          height: 'auto',
          aspectRatio: mediaAspect(placement),
          borderRadius: '10px',
        }}
      />
    </Box>
  ));
}

SiteImageGridSkeleton.propTypes = {
  placement: PropTypes.oneOf(['home_slide', 'gallery']).isRequired,
};
