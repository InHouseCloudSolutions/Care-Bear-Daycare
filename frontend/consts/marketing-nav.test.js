import {
  MARKETING_BOOK_NAV_ITEM,
  MARKETING_NAV_TREE,
  MARKETING_ROVER_NAV_ITEM,
} from './marketing-nav';
import { BOOK_STAY_PATH, ROVER_BOOKING_URL } from './routes';

describe('MARKETING_NAV_TREE', () => {
  it('lists the public Care Bear Daycare links without staff or millwork menus', () => {
    expect(MARKETING_NAV_TREE.map(item => item.label)).toEqual([
      'About',
      'How a stay works',
      'Care & safety',
      'Reviews',
      'Gallery',
      'Contact',
    ]);
    expect(MARKETING_BOOK_NAV_ITEM.href).toBe(BOOK_STAY_PATH);
    expect(MARKETING_ROVER_NAV_ITEM.href).toBe(ROVER_BOOKING_URL);
    expect(MARKETING_NAV_TREE.some(item => item.megaMenu || item.children)).toBe(false);
    expect(MARKETING_NAV_TREE.some(item => /login|staff|portfolio|niico/i.test(item.label))).toBe(
      false,
    );
  });
});
