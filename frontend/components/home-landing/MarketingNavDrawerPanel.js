'use client';

import Link from 'next/link';
import PropTypes from 'prop-types';
import { usePathname } from 'next/navigation';
import { Box, Button, IconButton } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import CloseIcon from '@mui/icons-material/Close';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PetsIcon from '@mui/icons-material/Pets';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useMarketingAccount } from '@/components/pet-parent/useAuthNavItem';
import {
  ABOUT_PATH,
  ACCOUNT_PATH,
  BOOK_STAY_PATH,
  CARE_AND_SAFETY_PATH,
  CONTACT_PATH,
  GALLERY_PATH,
  HOW_A_STAY_WORKS_PATH,
  LOGIN_PATH,
  REVIEWS_PATH,
  isExternalHref,
} from '@/consts/routes';
import { WEBSITE_INK } from '@/consts/website-theme';
import {
  HOME_BRAND,
  MARKETING_CTA_ORANGE,
  MARKETING_CTA_ORANGE_HOVER,
  isMarketingNavLinkActive,
} from './home-landing-data';
import { MarketingInitialsBadge } from './MarketingAccountControl';
import LuxuryNavDrawer from './LuxuryNavDrawer';
import MarketingWordmark from './MarketingWordmark';

const ICONS = {
  [ABOUT_PATH]: HomeOutlinedIcon,
  [HOW_A_STAY_WORKS_PATH]: PetsIcon,
  [CARE_AND_SAFETY_PATH]: ShieldOutlinedIcon,
  [REVIEWS_PATH]: StarBorderIcon,
  [GALLERY_PATH]: ImageOutlinedIcon,
  [CONTACT_PATH]: MailOutlineIcon,
};

const navItemShape = PropTypes.shape({
  label: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
  inset: PropTypes.bool,
});

function pageLinks(items) {
  return items.filter(
    item =>
      item.href &&
      !isExternalHref(item.href) &&
      item.href !== BOOK_STAY_PATH &&
      item.href !== LOGIN_PATH &&
      item.href !== ACCOUNT_PATH,
  );
}

export default function MarketingNavDrawerPanel({ open, onOpen, onClose, items }) {
  const pathname = usePathname();
  const account = useMarketingAccount();
  const { primaryCta, roverCta } = HOME_BRAND;
  const links = pageLinks(items);

  return (
    <LuxuryNavDrawer open={open} onOpen={onOpen} onClose={onClose}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2.5,
            pt: 2,
            pb: 1,
          }}
        >
          <MarketingWordmark />
          <IconButton aria-label="Close menu" onClick={onClose} sx={{ color: WEBSITE_INK }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ flex: '1 1 auto', overflowY: 'auto', minHeight: 0 }}>
          {links.map(item => {
            const Icon = ICONS[item.href];
            const active = isMarketingNavLinkActive(pathname, item.href);
            return (
              <Box
                key={item.href}
                component={Link}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                onClick={onClose}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.75,
                  px: 2.5,
                  py: 1.85,
                  position: 'relative',
                  color: WEBSITE_INK,
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: 16,
                  borderBottom: `1px solid ${alpha(WEBSITE_INK, 0.1)}`,
                  bgcolor: active ? alpha(MARKETING_CTA_ORANGE, 0.16) : 'transparent',
                  '&::before': active
                    ? {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        width: 3,
                        height: 22,
                        borderRadius: 999,
                        bgcolor: MARKETING_CTA_ORANGE,
                        transform: 'translateY(-50%)',
                      }
                    : undefined,
                }}
              >
                {Icon ? (
                  <Icon sx={{ fontSize: 22, color: active ? MARKETING_CTA_ORANGE : WEBSITE_INK }} />
                ) : null}
                {item.label}
              </Box>
            );
          })}

          <Box sx={{ px: 2.5, mt: 2.5 }}>
            <Button
              component={Link}
              href={primaryCta.href}
              onClick={onClose}
              fullWidth
              endIcon={<ArrowOutwardIcon aria-hidden />}
              sx={{
                py: 1.35,
                borderRadius: '12px',
                bgcolor: MARKETING_CTA_ORANGE,
                color: '#fff',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: 16,
                boxShadow: 'none',
                '&:hover': { bgcolor: MARKETING_CTA_ORANGE_HOVER, boxShadow: 'none' },
              }}
            >
              {primaryCta.label}
            </Button>
          </Box>

          {roverCta ? (
            <Box
              component="a"
              href={roverCta.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
                mt: 2.25,
                mb: 3,
                color: WEBSITE_INK,
                fontWeight: 700,
                fontSize: 15,
                textDecoration: 'underline',
                textUnderlineOffset: 3,
              }}
            >
              {roverCta.label}
              <OpenInNewIcon aria-hidden sx={{ fontSize: 16 }} />
            </Box>
          ) : null}
        </Box>

        <Box
          sx={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2.5,
            py: 1.75,
            borderTop: `1px solid ${alpha(WEBSITE_INK, 0.1)}`,
          }}
        >
          {account.isAuthenticated ? (
            <>
              <MarketingInitialsBadge initials={account.initials} size={42} />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Box sx={{ fontWeight: 700, fontSize: 15, color: WEBSITE_INK, lineHeight: 1.3 }}>
                  {account.name}
                </Box>
                {account.email ? (
                  <Box
                    sx={{
                      fontSize: 13,
                      color: alpha(WEBSITE_INK, 0.62),
                      lineHeight: 1.3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {account.email}
                  </Box>
                ) : null}
              </Box>
              <Button
                onClick={() => {
                  onClose();
                  account.logout();
                }}
                startIcon={<LogoutIcon />}
                sx={{
                  color: WEBSITE_INK,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: 14,
                  flexShrink: 0,
                  minWidth: 0,
                  px: 1,
                }}
              >
                Log out
              </Button>
            </>
          ) : (
            <Box
              component={Link}
              href={account.accountHref}
              onClick={onClose}
              sx={{
                color: WEBSITE_INK,
                fontWeight: 700,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Log in
            </Box>
          )}
        </Box>
      </Box>
    </LuxuryNavDrawer>
  );
}

MarketingNavDrawerPanel.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpen: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(navItemShape).isRequired,
};
