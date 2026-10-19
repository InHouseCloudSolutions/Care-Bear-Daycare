import Link from 'next/link';
import PropTypes from 'prop-types';
import {
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
} from '@mui/material';
import { isExternalHref } from '@/consts/routes';
import {
  LUXURY_DRAWER_NAV_GROUP_TYPOGRAPHY_SX,
  LUXURY_DRAWER_NAV_ITEM_DURATION_S,
  LUXURY_DRAWER_NAV_ITEM_ENTER_SX,
  LUXURY_DRAWER_NAV_ITEM_RESET_SX,
  LUXURY_DRAWER_NAV_ITEM_STAGGER_S,
  LUXURY_DRAWER_NAV_PRIMARY_TYPOGRAPHY_SX,
  LUXURY_DRAWER_NAV_SECTION_TYPOGRAPHY_SX,
  LUXURY_DRAWER_NAV_SUBLINK_TYPOGRAPHY_SX,
} from './home-landing-data';

const externalLinkProps = href =>
  isExternalHref(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {};

const navItemShape = PropTypes.shape({
  key: PropTypes.string,
  type: PropTypes.oneOf(['section', 'divider']),
  label: PropTypes.string,
  href: PropTypes.string,
  inset: PropTypes.bool,
  group: PropTypes.string,
  variant: PropTypes.oneOf(['link', 'group', 'sublink']),
  download: PropTypes.string,
});

function getItemTypographySx(item) {
  if (item.variant === 'group') return LUXURY_DRAWER_NAV_GROUP_TYPOGRAPHY_SX;
  if (item.variant === 'sublink') return LUXURY_DRAWER_NAV_SUBLINK_TYPOGRAPHY_SX;
  return LUXURY_DRAWER_NAV_PRIMARY_TYPOGRAPHY_SX;
}

function getItemButtonSx(item) {
  if (item.variant === 'sublink') return { pl: 6 };
  if (item.variant === 'group' || item.variant === 'link' || item.inset) return { pl: 4 };
  return undefined;
}

export default function LuxuryNavDrawerList({ open, items, onItemClick }) {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)', {
    defaultMatches: false,
    noSsr: true,
  });

  return (
    <List sx={LUXURY_DRAWER_NAV_ITEM_ENTER_SX}>
      {items.map((item, index) => {
        const staggerDelay = `${index * LUXURY_DRAWER_NAV_ITEM_STAGGER_S}s`;
        const itemKey =
          item.key ??
          `${item.type ?? ''}|${item.group ?? ''}|${item.label ?? ''}|${item.href ?? ''}`;

        const animationSx = reduceMotion
          ? undefined
          : {
              ...(!open && LUXURY_DRAWER_NAV_ITEM_RESET_SX),
              ...(open && {
                animation: `luxuryDrawerNavItemIn ${LUXURY_DRAWER_NAV_ITEM_DURATION_S}s cubic-bezier(0.22, 1, 0.36, 1) ${staggerDelay} both`,
              }),
            };

        if (item.type === 'divider') {
          return (
            <Divider
              key={itemKey}
              sx={{ borderColor: 'rgba(255,255,255,0.12)', my: 1.5, ...animationSx }}
            />
          );
        }

        if (item.type === 'section') {
          return (
            <ListItem
              key={itemKey}
              disablePadding
              sx={{ ...(index > 0 && { mt: 2 }), ...animationSx }}
            >
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ sx: LUXURY_DRAWER_NAV_SECTION_TYPOGRAPHY_SX }}
                sx={{ px: 2, py: 0.5 }}
              />
            </ListItem>
          );
        }

        const external = isExternalHref(item.href);
        const useAnchor = external || Boolean(item.download);

        return (
          <ListItem key={itemKey} disablePadding sx={animationSx}>
            <ListItemButton
              component={useAnchor ? 'a' : Link}
              href={item.href}
              {...externalLinkProps(item.href)}
              {...(item.download ? { download: item.download } : {})}
              onClick={onItemClick}
              sx={getItemButtonSx(item)}
            >
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ sx: getItemTypographySx(item) }}
              />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
}

LuxuryNavDrawerList.propTypes = {
  open: PropTypes.bool.isRequired,
  items: PropTypes.arrayOf(navItemShape).isRequired,
  onItemClick: PropTypes.func.isRequired,
};
