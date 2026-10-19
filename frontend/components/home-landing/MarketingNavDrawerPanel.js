import PropTypes from 'prop-types';
import { Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LuxuryNavDrawer from './LuxuryNavDrawer';
import LuxuryNavDrawerList from './LuxuryNavDrawerList';

const navItemShape = PropTypes.shape({
  label: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
  inset: PropTypes.bool,
});

export default function MarketingNavDrawerPanel({ open, onOpen, onClose, items }) {
  return (
    <LuxuryNavDrawer open={open} onOpen={onOpen} onClose={onClose}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        <IconButton aria-label="Close menu" onClick={onClose} sx={{ color: 'common.white' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <LuxuryNavDrawerList open={open} items={items} onItemClick={onClose} />
    </LuxuryNavDrawer>
  );
}

MarketingNavDrawerPanel.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpen: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(navItemShape).isRequired,
};
