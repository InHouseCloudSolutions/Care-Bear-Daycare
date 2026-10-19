/** Whether a required form value is present (strings trimmed; booleans must be true). */
export function isRequiredFieldFilled(value) {
  if (typeof value === 'boolean') return value;
  if (value === null || value === undefined) return false;
  return String(value).trim().length > 0;
}

/** True when every listed key on `values` passes {@link isRequiredFieldFilled}. */
export function areRequiredFieldsFilled(values, keys) {
  return keys.every(key => isRequiredFieldFilled(values[key]));
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

/** Basic format check for a single email string. */
export function isValidEmail(value) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return false;
  return EMAIL_PATTERN.test(trimmed);
}

/**
 * Required fields filled and every listed email key has a valid format.
 */
export function canSubmitRequiredForm(values, requiredKeys, emailKeys = []) {
  if (!areRequiredFieldsFilled(values, requiredKeys)) return false;
  return emailKeys.every(key => isValidEmail(values[key]));
}
