const { buildDaycareApiRewrites } = require('./daycareApiTarget.cjs');
import {
  daycareApiModeHeaders,
  daycareApiSwitchEnabled,
  readDaycareApiMode,
  writeDaycareApiMode,
} from './daycareApiTarget';

describe('buildDaycareApiRewrites', () => {
  it('uses only the production origin when the switch is off', () => {
    expect(buildDaycareApiRewrites({ DAYCARE_API_ORIGIN: 'https://api.example' })).toEqual([
      {
        source: '/daycare-api/:path*',
        destination: 'https://api.example/api/:path*/',
      },
    ]);
  });

  it('ignores the switch in production even when the flag is set', () => {
    expect(
      buildDaycareApiRewrites({
        NODE_ENV: 'production',
        DAYCARE_API_SWITCH: '1',
        DAYCARE_API_ORIGIN: 'https://api.example',
        DAYCARE_API_ORIGIN_LOCAL: 'http://localhost:3033',
      }),
    ).toEqual([
      {
        source: '/daycare-api/:path*',
        destination: 'https://api.example/api/:path*/',
      },
    ]);
  });

  it('sends local-mode cookie and header requests to the local origin', () => {
    const rules = buildDaycareApiRewrites({
      DAYCARE_API_SWITCH: '1',
      DAYCARE_API_ORIGIN: 'https://inhousecloudsolutions.com',
      DAYCARE_API_ORIGIN_LOCAL: 'http://host.docker.internal:3033/',
    });
    expect(rules).toHaveLength(3);
    expect(rules[0].has).toEqual([{ type: 'cookie', key: 'daycare-api-mode', value: 'local' }]);
    expect(rules[1].has).toEqual([{ type: 'header', key: 'x-daycare-api-mode', value: 'local' }]);
    expect(rules[0].destination).toBe('http://host.docker.internal:3033/api/:path*/');
    expect(rules[2].destination).toBe('https://inhousecloudsolutions.com/api/:path*/');
  });
});

describe('daycare API mode', () => {
  const previous = process.env.NEXT_PUBLIC_DAYCARE_API_SWITCH;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_DAYCARE_API_SWITCH = '1';
    window.localStorage.clear();
    document.cookie = 'daycare-api-mode=; Path=/; Max-Age=0';
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_DAYCARE_API_SWITCH = previous;
  });

  it('hides the chip in production even when the flag is set', () => {
    const previousNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      expect(daycareApiSwitchEnabled()).toBe(false);
    } finally {
      process.env.NODE_ENV = previousNodeEnv;
    }
  });

  it('adds the local header only after the mode is set to local', () => {
    expect(daycareApiModeHeaders()).toEqual({});
    writeDaycareApiMode('local');
    expect(readDaycareApiMode()).toBe('local');
    expect(daycareApiModeHeaders()).toEqual({ 'x-daycare-api-mode': 'local' });
    expect(document.cookie).toContain('daycare-api-mode=local');
    writeDaycareApiMode('production');
    expect(readDaycareApiMode()).toBe('production');
    expect(daycareApiModeHeaders()).toEqual({});
  });
});
