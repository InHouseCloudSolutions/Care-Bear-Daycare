import {
  ABOUT_PATH,
  BOOK_STAY_PATH,
  CARE_AND_SAFETY_PATH,
  CONTACT_PATH,
  GALLERY_PATH,
  HOW_A_STAY_WORKS_PATH,
  REVIEWS_PATH,
  ROVER_BOOKING_URL,
} from '@/consts/routes';

/** Page links in the desktop bar, mobile drawer, and footer. */
export const MARKETING_NAV_TREE = [
  { label: 'About', href: ABOUT_PATH },
  { label: 'How a stay works', href: HOW_A_STAY_WORKS_PATH },
  { label: 'Care & safety', href: CARE_AND_SAFETY_PATH },
  { label: 'Reviews', href: REVIEWS_PATH },
  { label: 'Gallery', href: GALLERY_PATH },
  { label: 'Contact', href: CONTACT_PATH },
];

/** Pulled out of the link row into the booking button. */
export const MARKETING_BOOK_NAV_ITEM = { label: 'Book a stay', href: BOOK_STAY_PATH };

/** Pulled out of the link row into the Rover text link. */
export const MARKETING_ROVER_NAV_ITEM = { label: 'See us on Rover', href: ROVER_BOOKING_URL };

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
