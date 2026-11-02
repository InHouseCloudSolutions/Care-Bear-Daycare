import { ACCOUNT_PATH } from '@/consts/routes';

/**
 * Where a signed-in visitor should leave the staff desk.
 * Staff stay. Anyone else who is signed in goes to their account.
 * A missing user is left to the auth gate (login), not sent to /account.
 * @param {{ isStaff?: boolean }|null|undefined} user
 * @returns {string|null}
 */
export function staffDeskRedirectPath(user) {
  if (!user) return null;
  if (user.isStaff === true) return null;
  return ACCOUNT_PATH;
}

/**
 * Client check before a holiday is sent. `ends_on` must be on or after `starts_on`.
 * ISO dates compare in calendar order.
 * @param {{ name?: string, startsOn?: string, endsOn?: string }} fields
 * @returns {string|null}
 */
export function holidayFormError({ name, startsOn, endsOn } = {}) {
  if (!String(name || '').trim()) return 'Name is required.';
  if (!startsOn || !endsOn) return 'Start and end dates are required.';
  if (endsOn < startsOn) return 'End date must be on or after the start date.';
  return null;
}

/**
 * @param {{ name?: string, startsOn: string, endsOn: string }} fields
 * @returns {{ name: string, starts_on: string, ends_on: string }}
 */
export function holidayPayload({ name, startsOn, endsOn }) {
  return {
    name: String(name || '').trim(),
    starts_on: startsOn,
    ends_on: endsOn,
  };
}

/** Body for staff confirm or decline. */
export function bookingStatusPatch(status) {
  return { status };
}

/**
 * Staff-created stays are confirmed immediately. No override flag.
 * @param {{ petParentId: number|string, serviceId: number|string, dogIds: Array<number|string>, startsOn: string, endsOn: string }} fields
 */
export function staffBookingBody({ petParentId, serviceId, dogIds, startsOn, endsOn }) {
  return {
    pet_parent_id: Number(petParentId),
    service_id: Number(serviceId),
    dogs: dogIds.map(id => Number(id)),
    starts_on: startsOn,
    ends_on: endsOn,
    status: 'confirmed',
  };
}

export function staffBookingFormError({ petParentId, serviceId, dogIds, startsOn, endsOn } = {}) {
  if (petParentId == null || petParentId === '') return 'Choose a household.';
  if (!Array.isArray(dogIds) || dogIds.length === 0) return 'Choose at least one dog.';
  if (serviceId == null || serviceId === '') return 'Choose a service.';
  if (!startsOn || !endsOn) return 'Start and end dates are required.';
  if (endsOn < startsOn) return 'End date must be on or after the start date.';
  return null;
}

/** @param {unknown} data */
export function asRecordList(data) {
  return Array.isArray(data) ? data : null;
}

export function householdLabel(parent) {
  const name = [parent?.first_name, parent?.last_name].filter(Boolean).join(' ');
  return name || parent?.email || `Household ${parent?.id}`;
}
