import PropTypes from 'prop-types';
import { Box, useTheme } from '@mui/material';

function HeaderLogo({ src, alt, themeAware = true }) {
  const theme = useTheme();
  const isDark = themeAware && theme.palette.mode === 'dark';

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
      <Box
        component="img"
        src={src}
        alt={alt}
        sx={{
          height: { xs: 'auto', sm: 96 },
          width: { xs: '100%', sm: 'auto' },
          display: 'block',
          objectFit: 'contain',
          filter: isDark ? 'invert(1)' : 'none',
        }}
      />
    </Box>
  );
}

HeaderLogo.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  themeAware: PropTypes.bool,
};

HeaderLogo.defaultProps = {
  alt: 'Logo',
  themeAware: true,
};

export default HeaderLogo;
