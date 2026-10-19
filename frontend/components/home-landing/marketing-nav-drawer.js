import { flattenNavItemsForDrawer } from '@/consts/marketing-nav';
import { LOGIN_NAV_LABEL, LOGOUT_NAV_LABEL, STAFF_NAV_LABEL } from './home-landing-data';

const AUTH_NAV_LABELS = new Set([LOGIN_NAV_LABEL, STAFF_NAV_LABEL, LOGOUT_NAV_LABEL]);

export function splitAuthNavItems(items) {
  const barItems = items.filter(item => !AUTH_NAV_LABELS.has(item.label));
  const authItems = items.filter(item => AUTH_NAV_LABELS.has(item.label));
  return { barItems, authItems };
}

/** Drawer list for the public site — marketing links only. */
export function buildMobileDrawerItems(items) {
  const { barItems } = splitAuthNavItems(items);
  return flattenNavItemsForDrawer(barItems);
}
