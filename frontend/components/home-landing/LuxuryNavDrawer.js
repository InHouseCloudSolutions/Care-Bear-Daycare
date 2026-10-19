import PropTypes from 'prop-types';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { NAV_GLASS_BACKDROP_COLOR } from '@/components/design-studio/design-studio-glass';
import { HOME_LUXURY_DRAWER_PAPER_SX } from './home-landing-data';

const iOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

/**
 * Right-anchored mobile nav drawer. Swipe left-to-right on the panel to dismiss.
 */
export default function LuxuryNavDrawer({ open, onOpen, onClose, children }) {
  return (
    <SwipeableDrawer
      anchor="right"
      open={open}
      onOpen={onOpen}
      onClose={onClose}
      disableSwipeToOpen
      disableBackdropTransition={!iOS}
      disableDiscovery={!iOS}
      ModalProps={{
        BackdropProps: {
          sx: { bgcolor: NAV_GLASS_BACKDROP_COLOR },
        },
      }}
      PaperProps={{ sx: HOME_LUXURY_DRAWER_PAPER_SX }}
    >
      {children}
    </SwipeableDrawer>
  );
}

LuxuryNavDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpen: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};
