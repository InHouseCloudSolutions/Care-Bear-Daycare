const PRODUCTION_ORIGIN_DEFAULT = 'https://inhousecloudsolutions.com';
const LOCAL_ORIGIN_DEFAULT = 'http://localhost:3033';

const MODE_COOKIE = 'daycare-api-mode';
const MODE_HEADER = 'x-daycare-api-mode';
const LOCAL = 'local';

function stripOrigin(value, fallback) {
  return String(value || fallback)
    .trim()
    .replace(/\/$/, '');
}

/**
 * Rewrite rules for `/daycare-api/:path*`.
 * The switch is off in production, and off unless DAYCARE_API_SWITCH=1.
 * A public deploy ignores a local-mode cookie or header and always uses
 * DAYCARE_API_ORIGIN.
 * API fetches send the header (they omit cookies). Image loads send the cookie.
 * @param {NodeJS.ProcessEnv} [env]
 */
function buildDaycareApiRewrites(env = process.env) {
  const production = stripOrigin(env.DAYCARE_API_ORIGIN, PRODUCTION_ORIGIN_DEFAULT);
  const local = stripOrigin(env.DAYCARE_API_ORIGIN_LOCAL, LOCAL_ORIGIN_DEFAULT);
  const productionRule = {
    source: '/daycare-api/:path*',
    destination: `${production}/api/:path*/`,
  };
  if (env.NODE_ENV === 'production' || env.DAYCARE_API_SWITCH !== '1') return [productionRule];
  const localRule = destination => ({
    source: '/daycare-api/:path*',
    destination,
  });
  const localDestination = `${local}/api/:path*/`;
  return [
    {
      ...localRule(localDestination),
      has: [{ type: 'cookie', key: MODE_COOKIE, value: LOCAL }],
    },
    {
      ...localRule(localDestination),
      has: [{ type: 'header', key: MODE_HEADER, value: LOCAL }],
    },
    productionRule,
  ];
}

module.exports = {
  PRODUCTION_ORIGIN_DEFAULT,
  LOCAL_ORIGIN_DEFAULT,
  MODE_COOKIE,
  MODE_HEADER,
  LOCAL,
  buildDaycareApiRewrites,
};
