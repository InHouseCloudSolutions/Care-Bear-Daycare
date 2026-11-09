'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import { Divider, IconButton, ListSubheader, Menu, MenuItem } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { fetchBookingPreview } from '@/lib/daycareApi';
import { cardIconSx, hairline } from './site-image-styles';

const EMAILS = [
  { kind: 'request-client', label: 'Request received (client)' },
  { kind: 'request-staff', label: 'New request (staff)' },
  { kind: 'confirmed-client', label: 'Stay confirmed (client)' },
];

function previewFailureMessage(status) {
  if (status === 404) return 'That booking could not be found, or this preview is not available.';
  if (status === 403) return 'Only staff can open these previews.';
  if (status === 0) return 'Could not reach the daycare API. Try again.';
  return 'Could not open that preview.';
}

/**
 * Writes the preview into a tab opened during the click.
 * A blob URL opened after the request returns is blocked, so the tab has to exist first.
 * @param {Window} previewWindow
 * @param {string} html
 * @returns {boolean}
 */
export function writeHtmlPreview(previewWindow, html) {
  try {
    const doc = previewWindow.document;
    doc.open();
    doc.write(html);
    doc.close();
    previewWindow.opener = null;
    return true;
  } catch {
    return false;
  }
}

const menuPaperSx = theme => ({
  mt: 0.5,
  minWidth: 240,
  borderRadius: '12px',
  bgcolor: 'background.paper',
  backgroundImage: 'none',
  border: '1px solid',
  borderColor: hairline(theme, 0.16),
});

function submenuOrigin() {
  return {
    anchorOrigin: { vertical: 'top', horizontal: 'left' },
    transformOrigin: { vertical: 'top', horizontal: 'right' },
  };
}

export default function StayDocumentsMenu({
  household,
  bookingId,
  token,
  disabled,
  actions,
  onAction,
  onEdit,
  onError,
  onNotify,
}) {
  const [anchor, setAnchor] = useState(null);
  const [emailAnchor, setEmailAnchor] = useState(null);
  const [invoiceAnchor, setInvoiceAnchor] = useState(null);
  const [busy, setBusy] = useState(false);

  const closeAll = () => {
    setAnchor(null);
    setEmailAnchor(null);
    setInvoiceAnchor(null);
  };

  const preview = async (kind, label) => {
    const previewWindow = window.open('', '_blank');
    closeAll();
    if (!previewWindow) {
      onError('The browser blocked the preview tab. Allow pop-ups for this site and try again.');
      return;
    }
    setBusy(true);
    onError(null);
    const res = await fetchBookingPreview(token, bookingId, kind);
    setBusy(false);
    const html = typeof res?.data === 'string' ? res.data.trim() : '';
    if (!res?.ok || !html) {
      previewWindow.close();
      onError(res?.ok ? 'The preview came back empty.' : previewFailureMessage(res?.status));
      return;
    }
    if (!writeHtmlPreview(previewWindow, html)) {
      previewWindow.close();
      onError('Could not open that preview.');
      return;
    }
    onNotify(`${label} opened.`);
  };

  const postLater = label => {
    closeAll();
    onNotify(`Posting ${label} is not available from the desk yet.`);
  };

  return (
    <>
      <IconButton
        aria-label={`Stay options for ${household}`}
        aria-haspopup="menu"
        aria-controls={anchor ? `stay-documents-${bookingId}` : undefined}
        aria-expanded={anchor ? 'true' : undefined}
        disabled={disabled || busy}
        size="small"
        onClick={event => setAnchor(event.currentTarget)}
        sx={theme => ({ ...cardIconSx(theme), flexShrink: 0 })}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu
        id={`stay-documents-${bookingId}`}
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={closeAll}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: menuPaperSx }}
      >
        <MenuItem
          disabled={disabled}
          aria-label={`Edit stay for ${household}`}
          onClick={() => {
            closeAll();
            onEdit();
          }}
        >
          Edit
        </MenuItem>
        {actions.map(action => (
          <MenuItem
            key={action.status}
            disabled={disabled}
            onClick={() => {
              closeAll();
              onAction(action);
            }}
          >
            {action.label}
          </MenuItem>
        ))}
        <Divider />
        <MenuItem
          aria-haspopup="menu"
          aria-expanded={emailAnchor ? 'true' : undefined}
          onClick={event => setEmailAnchor(event.currentTarget)}
        >
          Emails
          <ChevronRightIcon fontSize="small" sx={{ ml: 'auto' }} />
        </MenuItem>
        <MenuItem
          aria-haspopup="menu"
          aria-expanded={invoiceAnchor ? 'true' : undefined}
          onClick={event => setInvoiceAnchor(event.currentTarget)}
        >
          Invoice
          <ChevronRightIcon fontSize="small" sx={{ ml: 'auto' }} />
        </MenuItem>
      </Menu>
      <Menu
        anchorEl={emailAnchor}
        open={Boolean(emailAnchor)}
        onClose={() => setEmailAnchor(null)}
        {...submenuOrigin()}
        PaperProps={{ sx: menuPaperSx }}
      >
        <ListSubheader>Preview</ListSubheader>
        {EMAILS.map(item => (
          <MenuItem key={`preview-${item.kind}`} onClick={() => preview(item.kind, item.label)}>
            {item.label}
          </MenuItem>
        ))}
        <Divider />
        <ListSubheader>Post</ListSubheader>
        {EMAILS.map(item => (
          <MenuItem key={`post-${item.kind}`} onClick={() => postLater(item.label)}>
            {`Post ${item.label}`}
          </MenuItem>
        ))}
      </Menu>
      <Menu
        anchorEl={invoiceAnchor}
        open={Boolean(invoiceAnchor)}
        onClose={() => setInvoiceAnchor(null)}
        {...submenuOrigin()}
        PaperProps={{ sx: menuPaperSx }}
      >
        <MenuItem onClick={() => preview('invoice', 'Invoice')}>Preview</MenuItem>
        <MenuItem onClick={() => postLater('the invoice')}>Post</MenuItem>
      </Menu>
    </>
  );
}

StayDocumentsMenu.propTypes = {
  household: PropTypes.string.isRequired,
  bookingId: PropTypes.number.isRequired,
  token: PropTypes.string,
  disabled: PropTypes.bool,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      status: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  onAction: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onNotify: PropTypes.func.isRequired,
};
