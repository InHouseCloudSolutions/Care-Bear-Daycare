import PropTypes from 'prop-types';
import RouteThemeShell from '@/components/layouts/RouteThemeShell';
import { ROBOTS_INDEX } from '@/utils/seo';

export const metadata = {
  robots: ROBOTS_INDEX,
};

export default function WebsiteLayout({ children }) {
  return <RouteThemeShell variant="website">{children}</RouteThemeShell>;
}

WebsiteLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
