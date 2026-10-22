import Link from 'next/link';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import PinterestIcon from '@mui/icons-material/Pinterest';
import XIcon from '@mui/icons-material/X';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { HOME_BRAND, HOME_FOOTER, HOME_FOOTER_SOCIAL_LINKS } from './home-landing-data';

const FOOTER_SOCIAL_BELOW_SPACING = 1.5;

const SOCIAL_ICONS = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  linkedin: LinkedInIcon,
  x: XIcon,
  pinterest: PinterestIcon,
};

const footerLinkSx = {
  color: 'rgba(255, 255, 255, 0.72)',
  textDecoration: 'none',
  letterSpacing: '0.06em',
  fontSize: 12,
  fontWeight: 600,
  '&:hover': {
    color: 'common.white',
    textDecoration: 'underline',
  },
};

const footerTextSx = {
  color: 'rgba(255, 255, 255, 0.62)',
  letterSpacing: '0.04em',
  fontSize: 12,
  textShadow: '0 1px 6px rgba(0, 0, 0, 0.45)',
};

const socialIconButtonSx = {
  color: 'rgba(255, 255, 255, 0.62)',
  '&:hover': {
    color: 'common.white',
    bgcolor: 'transparent',
  },
};

export default function HomeLandingFooter() {
  const currentYear = new Date().getFullYear();
  const { placeLine, webCredit } = HOME_FOOTER;

  return (
    <Box
      component="footer"
      sx={{
        position: 'relative',
        zIndex: 2,
        flexShrink: 0,
        py: { xs: 2, md: 2.5 },
        px: 2,
      }}
    >
      <Stack alignItems="center">
        {HOME_FOOTER_SOCIAL_LINKS.length > 0 ? (
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            justifyContent="center"
            sx={{ mb: FOOTER_SOCIAL_BELOW_SPACING }}
          >
            {HOME_FOOTER_SOCIAL_LINKS.map(({ label, href, icon }) => {
              const Icon = SOCIAL_ICONS[icon];
              return (
                <IconButton
                  key={icon}
                  component="a"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  size="small"
                  sx={socialIconButtonSx}
                >
                  <Icon fontSize="small" />
                </IconButton>
              );
            })}
          </Stack>
        ) : null}

        <Typography component="p" sx={{ ...footerTextSx, mb: 0.75 }}>
          {placeLine}
        </Typography>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 0.75, sm: 1.5 }}
          alignItems="center"
          justifyContent="center"
        >
          <Typography component="p" sx={footerTextSx}>
            © {currentYear} {HOME_BRAND.name}
          </Typography>
          <Typography
            component="span"
            aria-hidden
            sx={{
              ...footerTextSx,
              display: { xs: 'none', sm: 'inline' },
              opacity: 0.5,
            }}
          >
            ·
          </Typography>
          <Box
            component={Link}
            href={webCredit.href}
            target="_blank"
            rel="noopener noreferrer"
            sx={footerLinkSx}
          >
            {webCredit.label}
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}
