import PropTypes from 'prop-types';
import { Box, TextField } from '@mui/material';
import { GLASS_FIELD_WRAPPER_SX, GLASS_TAB_LABEL_SX } from './design-studio-glass';

function toSxArray(sx) {
  if (!sx) return [];
  return Array.isArray(sx) ? sx : [sx];
}

/**
 * Outlined field with a solid label tab above the input (readable over glass backgrounds).
 * Label bottom is anchored to the input top so multi-line labels wrap without overlapping.
 */
export default function GlassTabTextField({
  label,
  required = false,
  error = false,
  sx,
  ...textFieldProps
}) {
  const tabId = textFieldProps.id || textFieldProps.name;
  const { sx: textFieldSx, ...restFieldProps } = textFieldProps;

  return (
    <Box sx={[GLASS_FIELD_WRAPPER_SX, ...toSxArray(sx)]}>
      <Box
        component="label"
        htmlFor={tabId}
        sx={{
          ...GLASS_TAB_LABEL_SX,
          ...(error && {
            color: '#ffcdd2',
            borderColor: 'rgba(255, 205, 210, 0.65)',
          }),
        }}
      >
        {label}
        {required ? ' *' : ''}
      </Box>
      <TextField
        {...restFieldProps}
        id={tabId}
        hiddenLabel
        required={required}
        error={error}
        sx={[
          {
            width: '100%',
            position: 'relative',
            zIndex: 1,
            flexShrink: 0,
          },
          ...toSxArray(textFieldSx),
        ]}
      />
    </Box>
  );
}

GlassTabTextField.propTypes = {
  label: PropTypes.string.isRequired,
  required: PropTypes.bool,
  error: PropTypes.bool,
  sx: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};
