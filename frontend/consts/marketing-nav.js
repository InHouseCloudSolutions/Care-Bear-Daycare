import {
  ABOUT_PATH,
  CARE_AND_SAFETY_PATH,
  CONTACT_PATH,
  GALLERY_PATH,
  HOW_A_STAY_WORKS_PATH,
  REVIEWS_PATH,
  ROVER_BOOKING_URL,
} from '@/consts/routes';

/** Shared marketing nav tree (desktop bar + mobile drawer). */
export const MARKETING_NAV_TREE = [
  { label: 'About', href: ABOUT_PATH },
  { label: 'How a stay works', href: HOW_A_STAY_WORKS_PATH },
  { label: 'Care and safety', href: CARE_AND_SAFETY_PATH },
  { label: 'Reviews', href: REVIEWS_PATH },
  { label: 'Gallery', href: GALLERY_PATH },
  { label: 'Book a stay', href: ROVER_BOOKING_URL },
  { label: 'Contact', href: CONTACT_PATH },
];

/** Home hero — same tree without a leading Home link (wordmark links home). */
export const HOME_NAV_ITEMS_BASE = MARKETING_NAV_TREE;

/** Interior marketing pages — same tree as home hero (wordmark links home). */
export const MARKETING_INTERIOR_NAV_ITEMS_BASE = MARKETING_NAV_TREE;

/** Flatten nav tree for mobile drawer (section headers + indented children). */
export function flattenNavItemsForDrawer(items) {
  const flat = [];
  items.forEach(item => {
    if (item.children?.length) {
      flat.push({ type: 'section', label: item.label, key: `section:${item.label}` });
      item.children.forEach(child => {
        flat.push({
          ...child,
          inset: true,
          group: item.label,
          variant: child.variant ?? 'link',
        });
      });
    } else if (item.href) {
      flat.push(item);
    }
  });
  return flat;
}
