import { useMemo } from 'react';
import { buildMobileDrawerItems } from './marketing-nav-drawer';

export default function useMarketingNavDrawerItems(navItems) {
  return useMemo(() => buildMobileDrawerItems(navItems), [navItems]);
}
