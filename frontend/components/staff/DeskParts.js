'use client';

import { useId } from 'react';
import PropTypes from 'prop-types';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Skeleton,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { WEBSITE_ACCENT, WEBSITE_HEART } from '@/consts/website-theme';
import { BOOKING_STATUS, bookingStatusLabel } from './staff-desk';
import {
  accentFilledSx,
  cardSx,
  dialogPaperSx,
  hairline,
  neutralPillSx,
  removeFilledSx,
} from './site-image-styles';

const POSITIVE = '#3E8E6A';

/**
 * Vertical flex stack. Children may shrink below their content width,
 * so long text truncates or wraps instead of pushing past the column.
 */
export function stackSx(gap = 1.5) {
  return { display: 'flex', flexDirection: 'column', gap, '& > *': { minWidth: 0 } };
}

/**
 * Wrapping flex row. Each child starts at `basis` wide, grows to share the row,
 * and wraps onto a new line when it would get narrower than that.
 */
export function flowSx(basis, gap = 1.5) {
  return {
    display: 'flex',
    flexWrap: 'wrap',
    gap,
    '& > *': { flex: `1 1 ${basis}`, minWidth: 0 },
  };
}

function toneSx(theme, tone) {
  const dark = theme.palette.mode === 'dark';
  switch (tone) {
    case 'accent':
      return {
        bgcolor: alpha(WEBSITE_ACCENT, dark ? 0.22 : 0.18),
        color: dark ? '#F2C08F' : '#8A4F17',
      };
    case 'positive':
      return { bgcolor: alpha(POSITIVE, dark ? 0.25 : 0.14), color: dark ? '#9ED8BC' : '#24654A' };
    case 'danger':
      return { bgcolor: alpha(WEBSITE_HEART, 0.16), color: dark ? '#F3A08C' : '#9E3520' };
    case 'muted':
      return { bgcolor: hairline(theme, 0.08), color: 'text.secondary' };
    default:
      return { bgcolor: hairline(theme, 0.12), color: 'text.primary' };
  }
}

/** Small rounded label, coloured by tone. */
export function ToneChip({ label, tone, icon }) {
  return (
    <Chip
      size="small"
      label={label}
      icon={icon}
      sx={theme => ({
        height: 24,
        borderRadius: 999,
        fontWeight: 700,
        fontSize: 12,
        letterSpacing: '0.02em',
        '& .MuiChip-icon': { color: 'inherit', fontSize: 15, ml: 0.75 },
        ...toneSx(theme, tone),
      })}
    />
  );
}

ToneChip.propTypes = {
  label: PropTypes.string.isRequired,
  tone: PropTypes.oneOf(['accent', 'positive', 'danger', 'muted', 'neutral']),
  icon: PropTypes.element,
};

export function StatusChip({ status }) {
  return <ToneChip label={bookingStatusLabel(status)} tone={BOOKING_STATUS[status]?.tone} />;
}

StatusChip.propTypes = { status: PropTypes.string };

/** Heading row for a tab: title, count, one-line help, and the main action on the right. */
export function DeskSectionHeader({ id, title, description, action }) {
  return (
    <Box
      sx={{
        mt: 3,
        display: 'flex',
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        flexDirection: { xs: 'column', sm: 'row' },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography id={id} component="h2" sx={{ fontWeight: 600, fontSize: 20 }}>
          {title}
        </Typography>
        {description ? (
          <Typography sx={{ mt: 0.25, color: 'text.secondary', fontSize: 14 }}>
            {description}
          </Typography>
        ) : null}
      </Box>
      {action}
    </Box>
  );
}

DeskSectionHeader.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.node,
  action: PropTypes.node,
};

/** Accent pill for "New …" buttons. */
export function NewButton({ children, onClick, startIcon }) {
  return (
    <Button variant="contained" onClick={onClick} startIcon={startIcon} sx={accentFilledSx}>
      {children}
    </Button>
  );
}

NewButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  startIcon: PropTypes.element,
};

export function EmptyState({ icon, title, body, action }) {
  return (
    <Box
      sx={theme => ({
        mt: 2,
        px: 3,
        py: { xs: 4, md: 5 },
        borderRadius: '16px',
        border: '1px dashed',
        borderColor: hairline(theme, 0.2),
        textAlign: 'center',
      })}
    >
      {icon ? (
        <Box sx={{ color: WEBSITE_ACCENT, '& svg': { fontSize: 36 } }} aria-hidden>
          {icon}
        </Box>
      ) : null}
      <Typography sx={{ mt: 1, fontWeight: 600 }}>{title}</Typography>
      {body ? (
        <Typography sx={{ mt: 0.5, color: 'text.secondary', fontSize: 14 }}>{body}</Typography>
      ) : null}
      {action ? <Box sx={{ mt: 2 }}>{action}</Box> : null}
    </Box>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.element,
  title: PropTypes.string.isRequired,
  body: PropTypes.node,
  action: PropTypes.node,
};

export function SkeletonRows({ count = 3, height = 76 }) {
  return (
    <Box sx={{ mt: 2, ...stackSx(1.5) }} aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <Skeleton key={index} variant="rounded" height={height} sx={{ borderRadius: '16px' }} />
      ))}
    </Box>
  );
}

SkeletonRows.propTypes = { count: PropTypes.number, height: PropTypes.number };

/** Bordered card used for every record row on the staff desk. */
export function RecordCard({ children, highlight, sx, ...props }) {
  return (
    <Box
      sx={theme => ({
        ...cardSx(theme),
        p: { xs: 2, md: 2.5 },
        ...(highlight && {
          borderColor: alpha(WEBSITE_ACCENT, 0.55),
          boxShadow: `inset 3px 0 0 ${WEBSITE_ACCENT}`,
        }),
        ...(typeof sx === 'function' ? sx(theme) : sx),
      })}
      {...props}
    >
      {children}
    </Box>
  );
}

RecordCard.propTypes = {
  children: PropTypes.node,
  highlight: PropTypes.bool,
  sx: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
};

/** Pill button for row actions. `primary` uses the caramel accent. */
export function RowButton({ primary, children, ...props }) {
  return (
    <Button
      variant={primary ? 'contained' : 'outlined'}
      size="small"
      sx={theme => ({
        ...(primary ? accentFilledSx : neutralPillSx(theme)),
        minHeight: 34,
        py: 0.5,
        px: 1.75,
      })}
      {...props}
    >
      {children}
    </Button>
  );
}

RowButton.propTypes = { primary: PropTypes.bool, children: PropTypes.node.isRequired };

function useFullScreenDialog() {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('sm'));
}

/**
 * Dialog wrapping a form. Submitting runs `onSubmit(event)`; the parent owns the fields.
 * `error` shows above the fields. The dialog goes full screen on phones.
 */
export function FormDialog({
  open,
  title,
  description,
  onClose,
  onSubmit,
  submitLabel,
  busy,
  error,
  children,
  maxWidth = 'sm',
}) {
  const fullScreen = useFullScreenDialog();
  const titleId = `${String(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')}-dialog-title`;
  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      fullWidth
      maxWidth={maxWidth}
      fullScreen={fullScreen}
      aria-labelledby={titleId}
      PaperProps={{ sx: fullScreen ? { backgroundImage: 'none' } : dialogPaperSx }}
    >
      <Box
        component="form"
        noValidate
        onSubmit={event => {
          event.preventDefault();
          onSubmit(event);
        }}
        sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}
      >
        <DialogTitle id={titleId} sx={{ fontWeight: 600, pb: description ? 0.5 : 1 }}>
          {title}
        </DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          {description ? (
            <Typography sx={{ color: 'text.secondary', fontSize: 14, mb: 2 }}>
              {description}
            </Typography>
          ) : null}
          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}
          {children}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1 }}>
          <Button onClick={onClose} disabled={busy} sx={theme => neutralPillSx(theme)}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={busy} sx={accentFilledSx}>
            {busy ? 'Saving…' : submitLabel}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

FormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.node,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitLabel: PropTypes.string.isRequired,
  busy: PropTypes.bool,
  error: PropTypes.string,
  children: PropTypes.node,
  maxWidth: PropTypes.oneOf(['xs', 'sm', 'md']),
};

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  onConfirm,
  onClose,
  busy,
  error,
}) {
  const titleId = useId();
  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby={titleId}
      PaperProps={{ sx: dialogPaperSx }}
    >
      <DialogTitle id={titleId} sx={{ fontWeight: 600 }}>
        {title}
      </DialogTitle>
      <DialogContent>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}
        <Typography sx={{ color: 'text.secondary' }}>{body}</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={onClose} disabled={busy} sx={theme => neutralPillSx(theme)}>
          Keep it
        </Button>
        <Button variant="contained" onClick={onConfirm} disabled={busy} sx={removeFilledSx}>
          {busy ? 'Working…' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  body: PropTypes.node,
  confirmLabel: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  busy: PropTypes.bool,
  error: PropTypes.string,
};

/** Two-column field grid on wider screens, one column on phones. */
export const fieldGridSx = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 2,
  '& > *': { flex: '1 1 220px', minWidth: 0 },
};

/** Small uppercase label above a group of fields or a detail block. */
export function GroupLabel({ children, sx }) {
  return (
    <Typography
      sx={{
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'text.secondary',
        ...sx,
      }}
    >
      {children}
    </Typography>
  );
}

GroupLabel.propTypes = { children: PropTypes.node, sx: PropTypes.object };
