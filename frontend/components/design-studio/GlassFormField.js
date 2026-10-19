import PropTypes from 'prop-types';
import { TextField } from '@mui/material';
import GlassTabTextField from './GlassTabTextField';

export default function GlassFormField({ isGlass, label, required, error, helperText, ...props }) {
  const denseProps = isGlass ? { margin: 'none', size: 'small' } : {};
  const resolvedHelper = helperText || undefined;

  if (isGlass) {
    return (
      <GlassTabTextField
        label={label}
        required={required}
        error={error}
        helperText={resolvedHelper}
        {...denseProps}
        {...props}
      />
    );
  }
  return (
    <TextField
      label={label}
      required={required}
      error={error}
      helperText={resolvedHelper}
      {...props}
    />
  );
}

GlassFormField.propTypes = {
  isGlass: PropTypes.bool,
  label: PropTypes.string.isRequired,
  required: PropTypes.bool,
  error: PropTypes.bool,
  helperText: PropTypes.string,
};
