'use client';

import PropTypes from 'prop-types';
import { Box, Tooltip, Typography } from '@mui/material';
import { photographerCreditFrom } from '@/utils/galleryImage';

const watermarkSx = {
  position: 'absolute',
  right: 8,
  bottom: 8,
  zIndex: 2,
  m: 0,
  px: 0.75,
  py: 0.25,
  maxWidth: '75%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: '0.6875rem',
  lineHeight: 1.3,
  letterSpacing: '0.02em',
  color: 'rgba(255, 255, 255, 0.82)',
  textShadow: '0 1px 2px rgba(0, 0, 0, 0.55)',
  pointerEvents: 'none',
  userSelect: 'none',
};

/**
 * Renders an image; when photographerCredit is set, adds a subtle bottom-right
 * watermark and an accessible MUI Tooltip without blocking parent click handlers.
 */
export default function CreditedImage({
  src,
  alt = '',
  photographerCredit,
  sx,
  imgSx,
  className,
  imgClassName,
  style,
  imgStyle,
  wrapperProps,
  ...imgProps
}) {
  const credit =
    typeof photographerCredit === 'string'
      ? photographerCredit.trim()
      : photographerCreditFrom(photographerCredit);

  const image = (
    <Box
      component="img"
      src={src}
      alt={alt}
      className={imgClassName ?? (!credit ? className : undefined)}
      style={imgStyle ?? (!credit ? style : undefined)}
      sx={imgSx}
      {...imgProps}
    />
  );

  if (!credit) {
    return image;
  }

  const tooltipTitle = `Photo: ${credit}`;

  return (
    <Tooltip title={tooltipTitle} enterDelay={350} describeChild>
      <Box
        className={className}
        style={style}
        tabIndex={0}
        aria-label={tooltipTitle}
        {...wrapperProps}
        sx={{
          position: 'relative',
          display: 'block',
          width: '100%',
          height: '100%',
          minHeight: 0,
          outline: 'none',
          ...sx,
          ...(wrapperProps?.sx || {}),
        }}
      >
        {image}
        <Typography component="span" aria-hidden sx={watermarkSx}>
          {credit}
        </Typography>
      </Box>
    </Tooltip>
  );
}

CreditedImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  photographerCredit: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  sx: PropTypes.oneOfType([PropTypes.object, PropTypes.func, PropTypes.array]),
  imgSx: PropTypes.oneOfType([PropTypes.object, PropTypes.func, PropTypes.array]),
  className: PropTypes.string,
  imgClassName: PropTypes.string,
  style: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  imgStyle: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  wrapperProps: PropTypes.object,
};
