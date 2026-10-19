import Link from 'next/link';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';

const LOGO_SRC = '/imgs/logos/logo_hori.png';
const LOGO_ALT = 'Care Bear Daycare';
/** CSS height matches the nav menu button (40px) so the bar does not grow. */
const LOGO_DISPLAY_HEIGHT = 40;
/** Source is 2172×724 (3:1). */
const LOGO_DISPLAY_WIDTH = 120;

export default function MarketingWordmark({ href = '/' }) {
  return (
    <Box
      component={Link}
      href={href}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        flexShrink: 0,
        lineHeight: 0,
        textDecoration: 'none',
      }}
    >
      <Box
        component="img"
        src={LOGO_SRC}
        alt={LOGO_ALT}
        width={LOGO_DISPLAY_WIDTH}
        height={LOGO_DISPLAY_HEIGHT}
        sx={{
          display: 'block',
          height: LOGO_DISPLAY_HEIGHT,
          width: LOGO_DISPLAY_WIDTH,
          maxHeight: LOGO_DISPLAY_HEIGHT,
          objectFit: 'contain',
        }}
      />
    </Box>
  );
}

MarketingWordmark.propTypes = {
  href: PropTypes.string,
};
