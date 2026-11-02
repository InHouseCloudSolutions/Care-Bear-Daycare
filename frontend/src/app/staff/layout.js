import PropTypes from 'prop-types';
import RouteThemeShell from '@/components/layouts/RouteThemeShell';
import { ROBOTS_NOINDEX } from '@/utils/seo';

export const metadata = {
  title: 'Staff desk',
  robots: ROBOTS_NOINDEX,
};

export default function StaffLayout({ children }) {
  return <RouteThemeShell variant="staff">{children}</RouteThemeShell>;
}

StaffLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
