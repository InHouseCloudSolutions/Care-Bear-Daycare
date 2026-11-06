'use client';

import { forwardRef, useCallback, useState } from 'react';
import NextLink from 'next/link';
import PropTypes from 'prop-types';
import { Alert, Box, Button, MenuItem, TextField, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { HOME_FOOTER } from '@/components/home-landing/home-landing-data';
import { BOOK_STAY_PATH } from '@/consts/routes';
import {
  WEBSITE_ACCENT,
  WEBSITE_INK,
  WEBSITE_INK_HOVER,
  WEBSITE_PAGE_BACKGROUND,
  WEBSITE_PAPER,
} from '@/consts/website-theme';
import { formatApiErrors, submitContactInquiry } from '@/lib/daycareApi';
import publicPath from '@/utils/publicPath';
import DogHotelInteriorPage from '@/components/dog-hotel/DogHotelInteriorPage';

const CONTACT_EMAIL = 'contact@carebeardaycare.ca';
const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('daycare consultation')}`;

const TEAL = WEBSITE_INK;
const CARAMEL = WEBSITE_ACCENT;
const CARAMEL_HOVER = '#C88545';
const TEAL_DARK = '#082F34';
const BODY_MUTED = '#6A625A';
const CARD_BORDER = '#E6DCCF';
const BANNER_BG = '#EFE3D0';

const ICON = {
  envelope: publicPath('/imgs/contact/envelope-orange.svg'),
  arrowExternalCream: publicPath('/imgs/contact/arrow-external-cream.svg'),
  arrowExternalTeal: publicPath('/imgs/contact/arrow-external-teal.svg'),
  locationPin: publicPath('/imgs/contact/location-pin-orange.svg'),
  chevronDown: publicPath('/imgs/contact/chevron-down-teal.svg'),
  arrowRightCream: publicPath('/imgs/contact/arrow-right-cream.svg'),
  calendarHeart: publicPath('/imgs/contact/calendar-heart.svg'),
};

const TOPIC_OPTIONS = [
  { value: 'daycare', label: 'Daycare' },
  { value: 'overnight', label: 'Overnight care' },
  { value: 'fit', label: 'Finding the right fit' },
  { value: 'other', label: 'Something else' },
];

const eyebrowSx = {
  color: TEAL,
  fontWeight: 700,
  fontSize: 12,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
};

const displaySx = {
  color: TEAL,
  fontWeight: 700,
  letterSpacing: '-0.02em',
  lineHeight: 1.08,
};

const fieldLabelSx = {
  display: 'block',
  mb: 0.75,
  color: TEAL,
  fontWeight: 700,
  fontSize: '0.92rem',
  lineHeight: 1.3,
};

const fieldPaperSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: '#fff',
    borderRadius: '10px',
    '& fieldset': { borderColor: '#E4D8C8' },
    '&:hover fieldset': { borderColor: alpha(TEAL, 0.35) },
    '&.Mui-focused fieldset': { borderColor: TEAL },
  },
  '& .MuiOutlinedInput-input, & .MuiSelect-select': {
    py: 1.2,
    px: 1.5,
    fontSize: '0.95rem',
  },
  '& .MuiSelect-select': {
    pr: '40px !important',
  },
  '& .MuiFormHelperText-root': {
    mx: 0,
    mt: 0.5,
  },
};

function stripApiFieldPrefix(field) {
  if (typeof field !== 'string') return field;
  return field.replace(/^(non_field_errors|__all__)\.?/i, '') || field;
}

function mapApiFieldToFormKey(field) {
  const f = stripApiFieldPrefix(field);
  if (f === 'name') return 'name';
  if (f === 'email') return 'email';
  if (f === 'dog_name') return 'dogName';
  if (f === 'topic') return 'topic';
  if (f === 'message') return 'message';
  return null;
}

function looksLikeEmail(value) {
  const v = String(value).trim();
  if (!v) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function InlineIcon({ src, alt = '', size }) {
  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      sx={{ width: size, height: size, display: 'block', flexShrink: 0 }}
    />
  );
}

InlineIcon.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  size: PropTypes.number.isRequired,
};

const ContactTopicChevron = forwardRef(function ContactTopicChevron(props, ref) {
  const { className, ...rest } = props;
  return (
    <Box
      {...rest}
      ref={ref}
      className={className}
      component="span"
      sx={{
        right: 12,
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        top: '50%',
        transform: 'translateY(-50%)',
      }}
    >
      <Box
        component="img"
        src={ICON.chevronDown}
        alt=""
        aria-hidden
        sx={{ width: 16, height: 16, display: 'block' }}
      />
    </Box>
  );
});

ContactTopicChevron.propTypes = {
  className: PropTypes.string,
};

export default function ContactFormPage() {
  const { placeLine } = HOME_FOOTER;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dogName, setDogName] = useState('');
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    topic: false,
    message: false,
  });

  const [clientErrors, setClientErrors] = useState({});
  const [apiFieldErrors, setApiFieldErrors] = useState({});
  const [apiSummary, setApiSummary] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = useCallback(() => {
    const next = {};
    const n = name.trim();
    const e = email.trim();
    const t = topic;
    const m = message.trim();

    if (!n) next.name = 'Enter your name.';
    if (!e) next.email = 'Enter your email.';
    else if (!looksLikeEmail(e)) next.email = 'Enter a valid email address.';
    if (!t) next.topic = 'Choose a topic.';
    if (!m) next.message = 'Enter a message.';

    return next;
  }, [name, email, topic, message]);

  const runValidation = useCallback(() => {
    const next = validate();
    setClientErrors(next);
    return next;
  }, [validate]);

  const handleBlur = field => {
    setTouched(current => ({ ...current, [field]: true }));
    setClientErrors(current => {
      const errs = validate();
      if (field === 'name') return { ...current, name: errs.name };
      if (field === 'email') return { ...current, email: errs.email };
      if (field === 'topic') return { ...current, topic: errs.topic };
      if (field === 'message') return { ...current, message: errs.message };
      return current;
    });
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setTouched({ name: true, email: true, topic: true, message: true });
    setApiSummary(null);
    setApiFieldErrors({});

    const errs = runValidation();
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    const body = {
      name: name.trim(),
      email: email.trim(),
      dog_name: dogName.trim(),
      topic,
      message: message.trim(),
    };

    const response = await submitContactInquiry(body);
    setSubmitting(false);

    if (response.status === 201) {
      setSubmitted(true);
      return;
    }

    const { summary, fields } = formatApiErrors(response.data);
    const mapped = {};
    Object.entries(fields).forEach(([k, msg]) => {
      const formKey = mapApiFieldToFormKey(k);
      if (formKey) mapped[formKey] = msg;
    });
    setApiFieldErrors(mapped);

    if (response.status === 400 && Object.keys(mapped).length > 0) {
      setApiSummary(summary);
      return;
    }

    setApiSummary(
      summary || 'We could not send your message. Email contact@carebeardaycare.ca instead.',
    );
  };

  const getFieldError = useCallback(
    key => {
      if (apiFieldErrors[key]) return apiFieldErrors[key];
      if (!touched[key]) return '';
      return clientErrors[key] || '';
    },
    [apiFieldErrors, touched, clientErrors],
  );

  return (
    <DogHotelInteriorPage
      title="Contact"
      suppressHeading
      frameMaxWidth={1120}
      contentSx={{ bgcolor: WEBSITE_PAGE_BACKGROUND }}
    >
      <Box
        component="header"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 0.92fr) minmax(0, 1.08fr)' },
          columnGap: { md: 5 },
          rowGap: { xs: 3, md: 4.5 },
          alignItems: 'start',
        }}
      >
        <Box>
          <Typography component="p" sx={eyebrowSx}>
            Contact
          </Typography>
          <Typography
            component="h1"
            sx={{
              ...displaySx,
              fontSize: { xs: '2.6rem', md: '3.5rem' },
              m: 0,
              mt: 1.25,
              maxWidth: 520,
            }}
          >
            Let&apos;s talk
            <br />
            about your dog.
          </Typography>
        </Box>

        <Typography
          component="p"
          sx={{
            m: 0,
            color: TEAL,
            fontSize: { xs: '1.05rem', md: '1.15rem' },
            lineHeight: 1.5,
            fontWeight: 500,
            maxWidth: 420,
            mt: { xs: 0, md: '2.35rem' },
          }}
        >
          Questions about daycare, overnight care, or finding the right fit? We&apos;d love to hear
          from you.
        </Typography>

        <Box>
          <Box
            sx={{
              borderRadius: '22px',
              overflow: 'hidden',
              bgcolor: '#EFE6D8',
              aspectRatio: '1 / 1.02',
              width: '100%',
            }}
          >
            <Box
              component="img"
              src={publicPath('/imgs/CarrieB.png')}
              alt="Carrie Baron with a dog"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 18%',
                transform: 'scale(1.22)',
                transformOrigin: 'center 15%',
                display: 'block',
              }}
            />
          </Box>

          <Typography component="p" sx={{ ...displaySx, fontSize: '1.2rem', mt: 2 }}>
            Carrie Baron
          </Typography>
          <Typography
            component="p"
            sx={{ m: 0, mt: 0.35, color: BODY_MUTED, fontSize: '0.975rem' }}
          >
            Owner &amp; Dog Boarding Specialist
          </Typography>

          <Box
            sx={{
              mt: 2.5,
              bgcolor: TEAL,
              borderRadius: '18px',
              color: '#fff',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: { xs: 2.25, md: 2.5 } }}
            >
              <InlineIcon src={ICON.envelope} size={22} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  component="p"
                  sx={{
                    m: 0,
                    fontWeight: 700,
                    fontSize: 11,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: alpha('#fff', 0.82),
                  }}
                >
                  Email Carrie
                </Typography>
                <Typography
                  component="a"
                  href={CONTACT_MAILTO}
                  sx={{
                    display: 'block',
                    mt: 0.75,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: { xs: '1.2rem', sm: '1.35rem' },
                    lineHeight: 1.25,
                    textDecoration: 'none',
                    wordBreak: 'break-word',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  {CONTACT_EMAIL}
                </Typography>
                <Box
                  component="a"
                  href={CONTACT_MAILTO}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    mt: 1.25,
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                    '&:hover': { color: alpha('#fff', 0.92) },
                  }}
                >
                  Write an email
                  <InlineIcon src={ICON.arrowExternalCream} size={14} />
                </Box>
              </Box>
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                px: { xs: 2.25, md: 2.5 },
                py: 2,
                borderTop: `1px solid ${alpha('#fff', 0.16)}`,
              }}
            >
              <InlineIcon src={ICON.locationPin} size={22} />
              <Box>
                <Typography
                  component="p"
                  sx={{ m: 0, fontWeight: 700, fontSize: '1.02rem', color: '#fff' }}
                >
                  {placeLine}
                </Typography>
                <Typography
                  component="p"
                  sx={{ m: 0, mt: 0.35, color: alpha('#fff', 0.78), fontSize: '0.95rem' }}
                >
                  Home-based daycare &amp; overnight care
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            alignSelf: 'stretch',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: WEBSITE_PAPER,
            border: `1px solid ${CARD_BORDER}`,
            borderRadius: '22px',
            p: { xs: 2.25, md: 3 },
          }}
        >
          <Typography
            component="h2"
            sx={{ ...displaySx, fontSize: { xs: '1.45rem', md: '1.65rem' } }}
          >
            Send Carrie a message
          </Typography>
          <Typography component="p" sx={{ m: 0, mt: 1, color: BODY_MUTED, lineHeight: 1.6 }}>
            Tell us a little about your dog and how we can help.
          </Typography>

          {submitted ? (
            <Typography
              component="p"
              role="status"
              sx={{ mt: 4, color: TEAL, fontWeight: 600, fontSize: '1.05rem', lineHeight: 1.55 }}
            >
              Message sent. Carrie will get back to you.
            </Typography>
          ) : (
            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit}
              sx={{
                mt: 3,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}
            >
              {apiSummary ? (
                <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
                  {apiSummary}
                </Alert>
              ) : null}

              <Box
                sx={{
                  display: 'grid',
                  width: '100%',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  columnGap: 2,
                  rowGap: 2.25,
                }}
              >
                <Box>
                  <Typography component="label" htmlFor="contact-name" sx={fieldLabelSx}>
                    Your name
                  </Typography>
                  <TextField
                    id="contact-name"
                    name="name"
                    hiddenLabel
                    placeholder="Full name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onBlur={() => handleBlur('name')}
                    error={Boolean(getFieldError('name'))}
                    helperText={getFieldError('name')}
                    fullWidth
                    required
                    disabled={submitting}
                    sx={fieldPaperSx}
                  />
                </Box>
                <Box>
                  <Typography component="label" htmlFor="contact-email" sx={fieldLabelSx}>
                    Email address
                  </Typography>
                  <TextField
                    id="contact-email"
                    name="email"
                    type="email"
                    hiddenLabel
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onBlur={() => handleBlur('email')}
                    error={Boolean(getFieldError('email'))}
                    helperText={getFieldError('email')}
                    fullWidth
                    required
                    disabled={submitting}
                    sx={fieldPaperSx}
                  />
                </Box>
                <Box>
                  <Typography component="label" htmlFor="contact-dog-name" sx={fieldLabelSx}>
                    Dog&apos;s name (optional)
                  </Typography>
                  <TextField
                    id="contact-dog-name"
                    name="dog_name"
                    hiddenLabel
                    placeholder="Your dog's name"
                    value={dogName}
                    onChange={e => setDogName(e.target.value)}
                    fullWidth
                    disabled={submitting}
                    sx={fieldPaperSx}
                  />
                </Box>
                <Box>
                  <Typography
                    id="contact-topic-label"
                    component="label"
                    htmlFor="contact-topic"
                    sx={fieldLabelSx}
                  >
                    What&apos;s your question about?
                  </Typography>
                  <TextField
                    id="contact-topic"
                    name="topic"
                    select
                    hiddenLabel
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    onBlur={() => handleBlur('topic')}
                    error={Boolean(getFieldError('topic'))}
                    helperText={getFieldError('topic')}
                    fullWidth
                    required
                    disabled={submitting}
                    SelectProps={{
                      displayEmpty: true,
                      labelId: 'contact-topic-label',
                      IconComponent: ContactTopicChevron,
                      MenuProps: {
                        PaperProps: {
                          sx: {
                            borderRadius: '12px',
                            border: `1px solid ${CARD_BORDER}`,
                            mt: 0.5,
                            '& .MuiMenuItem-root': { fontSize: '0.95rem' },
                          },
                        },
                      },
                    }}
                    sx={fieldPaperSx}
                  >
                    <MenuItem value="" disabled>
                      Choose a topic
                    </MenuItem>
                    {TOPIC_OPTIONS.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              </Box>

              <Box
                sx={{
                  mt: 2.25,
                  width: '100%',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 0,
                }}
              >
                <Typography component="label" htmlFor="contact-message" sx={fieldLabelSx}>
                  Your message
                </Typography>
                <TextField
                  id="contact-message"
                  name="message"
                  hiddenLabel
                  placeholder="Tell us about your dog or ask a question..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onBlur={() => handleBlur('message')}
                  error={Boolean(getFieldError('message'))}
                  helperText={getFieldError('message')}
                  fullWidth
                  required
                  multiline
                  minRows={4}
                  disabled={submitting}
                  sx={{
                    ...fieldPaperSx,
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    '& .MuiInputBase-root': {
                      flex: 1,
                      alignItems: 'stretch',
                    },
                    '& .MuiInputBase-inputMultiline': {
                      height: '100% !important',
                      boxSizing: 'border-box',
                    },
                  }}
                />
              </Box>

              <Typography
                component="p"
                sx={{ m: 0, mt: 0.5, color: BODY_MUTED, fontSize: '0.9rem', width: '100%' }}
              >
                For dates and stay requests, use{' '}
                <Box
                  component={NextLink}
                  href={BOOK_STAY_PATH}
                  sx={{
                    color: TEAL,
                    fontWeight: 700,
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                  }}
                >
                  Book a stay
                </Box>
                .
              </Typography>

              <Button
                type="submit"
                disabled={submitting}
                endIcon={<InlineIcon src={ICON.arrowRightCream} alt="" size={16} />}
                sx={{
                  mt: 2,
                  width: 'auto',
                  px: 2.75,
                  py: 1.15,
                  bgcolor: CARAMEL,
                  color: '#fff',
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '1rem',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: CARAMEL_HOVER, boxShadow: 'none' },
                  '&:disabled': { bgcolor: alpha(CARAMEL, 0.5), color: '#fff' },
                }}
              >
                Send message
              </Button>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  gap: 0.75,
                  mt: 2,
                  alignSelf: 'stretch',
                  flexWrap: 'wrap',
                }}
              >
                <Typography component="span" sx={{ color: BODY_MUTED, fontSize: '0.95rem' }}>
                  Prefer email?
                </Typography>
                <Box
                  component="a"
                  href={CONTACT_MAILTO}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: TEAL,
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                    '&:hover': { color: WEBSITE_INK_HOVER, textDecoration: 'underline' },
                  }}
                >
                  {CONTACT_EMAIL}
                  <InlineIcon src={ICON.arrowExternalTeal} size={14} />
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: { xs: 2, md: 3 },
          mt: { xs: 4, md: 5 },
          px: { xs: 2.25, md: 3 },
          py: { xs: 2.25, md: 2.5 },
          borderRadius: '20px',
          bgcolor: BANNER_BG,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.75, flex: 1, minWidth: 0 }}>
          <InlineIcon src={ICON.calendarHeart} size={40} />
          <Box>
            <Typography
              component="p"
              sx={{ m: 0, color: TEAL, fontWeight: 700, fontSize: '1.05rem' }}
            >
              Planning a stay?
            </Typography>
            <Typography
              component="p"
              sx={{ m: 0, mt: 0.5, color: BODY_MUTED, fontSize: '0.95rem' }}
            >
              Choose your dogs and dates on our booking page.
            </Typography>
          </Box>
        </Box>
        <Button
          component={NextLink}
          href={BOOK_STAY_PATH}
          endIcon={<InlineIcon src={ICON.arrowRightCream} alt="" size={16} />}
          sx={{
            flexShrink: 0,
            bgcolor: TEAL,
            color: '#fff',
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: 16,
            px: 2.5,
            py: 1.15,
            boxShadow: 'none',
            '&:hover': { bgcolor: TEAL_DARK, boxShadow: 'none' },
          }}
        >
          Book a stay
        </Button>
      </Box>

      <Typography
        component="p"
        sx={{
          m: 0,
          mt: 2,
          textAlign: 'center',
          color: BODY_MUTED,
          fontSize: '0.85rem',
        }}
      >
        Stay requests are reviewed by staff before they are confirmed.
      </Typography>
    </DogHotelInteriorPage>
  );
}
