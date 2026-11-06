import Link from 'next/link';
import PropTypes from 'prop-types';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Box, Button, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { WEBSITE_INK, WEBSITE_PAGE_BACKGROUND } from '@/consts/website-theme';
import { MARKETING_NAV_TREE } from '@/consts/marketing-nav';
import { HOME_BRAND, HOME_FOOTER } from './home-landing-data';
import MarketingWordmark from './MarketingWordmark';

const mutedSx = {
  color: alpha(WEBSITE_INK, 0.62),
  fontSize: 14,
  lineHeight: 1.45,
};

const linkSx = {
  color: WEBSITE_INK,
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: 14.5,
  '&:hover': { textDecoration: 'underline' },
};

const rule = `1px solid ${alpha(WEBSITE_INK, 0.12)}`;

function ExploreColumns() {
  const midpoint = Math.ceil(MARKETING_NAV_TREE.length / 2);
  const columns = [MARKETING_NAV_TREE.slice(0, midpoint), MARKETING_NAV_TREE.slice(midpoint)];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        columnGap: { xs: 2, md: 4 },
        rowGap: 1.25,
      }}
    >
      {columns.map(column => (
        <Box key={column[0]?.href} sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          {column.map(item => (
            <Box key={item.href} component={Link} href={item.href} sx={linkSx}>
              {item.label}
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
}

function HeroFooter() {
  const year = new Date().getFullYear();
  const { webCredit } = HOME_FOOTER;

  return (
    <Box component="footer" sx={{ px: 2, py: 2 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 0.75, sm: 1.5 },
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          component="p"
          sx={{ m: 0, color: 'rgba(255,255,255,0.72)', fontSize: 12, letterSpacing: '0.04em' }}
        >
          © {year} {HOME_BRAND.name}
        </Typography>
        <Box
          component="a"
          href={webCredit.href}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: 'rgba(255,255,255,0.72)',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.04em',
            textDecoration: 'none',
            '&:hover': { color: '#fff', textDecoration: 'underline' },
          }}
        >
          {webCredit.label}
        </Box>
      </Box>
    </Box>
  );
}

function BandFooter() {
  const year = new Date().getFullYear();
  const { serviceLine, placeLine, contactEmail, webCredit } = HOME_FOOTER;
  const { primaryCta, roverCta } = HOME_BRAND;

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: WEBSITE_PAGE_BACKGROUND,
        color: WEBSITE_INK,
        px: { xs: 2.5, md: 6 },
        pt: { xs: 3.5, md: 5 },
        pb: { xs: 'calc(28px + 76px + env(safe-area-inset-bottom, 0px))', lg: 3.5 },
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(220px, 1.05fr) minmax(240px, 1.2fr) minmax(220px, 1fr)',
          },
          alignItems: 'stretch',
        }}
      >
        <Box
          sx={{
            pr: { lg: 4 },
            pb: { xs: 3, lg: 0 },
            borderRight: { lg: rule },
            borderBottom: { xs: rule, lg: 'none' },
          }}
        >
          <MarketingWordmark />
          <Typography component="p" sx={{ ...mutedSx, mt: 2, mb: 0 }}>
            {serviceLine}
          </Typography>
          <Typography component="p" sx={{ ...mutedSx, mt: 0.5, mb: 0 }}>
            {placeLine}
          </Typography>
        </Box>

        <Box
          sx={{
            px: { lg: 4 },
            py: { xs: 3, lg: 0 },
            borderRight: { lg: rule },
            borderBottom: { xs: rule, lg: 'none' },
          }}
        >
          <Typography component="h2" sx={{ m: 0, mb: 2, fontWeight: 700, fontSize: 16 }}>
            Explore
          </Typography>
          <ExploreColumns />
        </Box>

        <Box
          sx={{
            pl: { lg: 4 },
            pt: { xs: 3, lg: 0 },
            pb: { xs: 3, lg: 0 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <Typography component="h2" sx={{ m: 0, mb: 2, fontWeight: 700, fontSize: 16 }}>
            Get in touch
          </Typography>
          <Box component="a" href={`mailto:${contactEmail}`} sx={linkSx}>
            {contactEmail}
          </Box>
          {roverCta ? (
            <Box
              component="a"
              href={roverCta.href}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                ...linkSx,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                mt: 1.25,
                textDecoration: 'underline',
                textUnderlineOffset: 3,
              }}
            >
              {roverCta.label}
              <OpenInNewIcon aria-hidden sx={{ fontSize: 15 }} />
            </Box>
          ) : null}
          <Button
            component={Link}
            href={primaryCta.href}
            variant="outlined"
            sx={{
              display: 'flex',
              mt: 2.25,
              width: { xs: '100%', lg: 'auto' },
              alignSelf: 'flex-start',
              borderRadius: 999,
              borderColor: WEBSITE_INK,
              borderWidth: 1.5,
              color: WEBSITE_INK,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: 15,
              px: 2.5,
              py: 1,
              '&:hover': {
                borderColor: WEBSITE_INK,
                borderWidth: 1.5,
                bgcolor: alpha(WEBSITE_INK, 0.04),
              },
            }}
          >
            {primaryCta.label} →
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          mt: { xs: 0, lg: 4 },
          pt: 2.5,
          borderTop: rule,
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          alignItems: { xs: 'center', lg: 'center' },
          justifyContent: { lg: 'space-between' },
          gap: 0.75,
          textAlign: { xs: 'center', lg: 'left' },
        }}
      >
        <Typography component="p" sx={{ ...mutedSx, m: 0, fontSize: 13 }}>
          © {year} {HOME_BRAND.name}
        </Typography>
        <Box
          component="a"
          href={webCredit.href}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            ...mutedSx,
            fontSize: 13,
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          {webCredit.label}
        </Box>
      </Box>
    </Box>
  );
}

export default function HomeLandingFooter({ variant = 'band' }) {
  if (variant === 'hero') return <HeroFooter />;
  return <BandFooter />;
}

HomeLandingFooter.propTypes = {
  variant: PropTypes.oneOf(['band', 'hero']),
};
