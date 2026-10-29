import { MARKETING_NAV_TREE } from './marketing-nav';
import { BOOK_STAY_PATH, ROVER_BOOKING_URL } from './routes';

describe('MARKETING_NAV_TREE', () => {
  it('lists the public Care Bear Daycare links without staff or millwork menus', () => {
    expect(MARKETING_NAV_TREE.map(item => item.label)).toEqual([
      'About',
      'How a stay works',
      'Care and safety',
      'Reviews',
      'Gallery',
      'Book a stay',
      'See us on Rover',
      'Contact',
    ]);
    expect(MARKETING_NAV_TREE.find(item => item.label === 'Book a stay').href).toBe(BOOK_STAY_PATH);
    expect(MARKETING_NAV_TREE.find(item => item.label === 'See us on Rover').href).toBe(
      ROVER_BOOKING_URL,
    );
    expect(MARKETING_NAV_TREE.some(item => item.megaMenu || item.children)).toBe(false);
    expect(MARKETING_NAV_TREE.some(item => /login|staff|portfolio|niico/i.test(item.label))).toBe(
      false,
    );
  });
});
