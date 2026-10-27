const withPlugins = require('next-compose-plugins');
const withImages = require('next-images');

const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const pagesBasePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const config = {
  webpack: (webpackConfig, { webpack }) => {
    webpackConfig.resolve.alias['@@'] = __dirname;
    webpackConfig.resolve.alias['@wui'] = '@bequestinc/wui';
    // Optional linkedom peer; avoid native canvas in Docker/SSR builds
    webpackConfig.resolve.alias.canvas = false;
    webpackConfig.resolve.conditionNames = ['require', '...'];

    webpackConfig.plugins.push(
      new webpack.ProvidePlugin({
        React: 'react',
      }),
    );

    // Ensure rules array exists
    webpackConfig.module.rules = webpackConfig.module.rules || [];

    // Use SVGR for SVGs imported from JS/TS files
    webpackConfig.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    webpackConfig.cache = false;
    return webpackConfig;
  },
  env: {
    PROD: process.env.NODE_ENV === 'production' ? 'true' : 'false',
  },
  productionBrowserSourceMaps: true,
  poweredByHeader: false,
  reactStrictMode: true,
  output: isGitHubPages ? 'export' : 'standalone',
  ...(isGitHubPages
    ? {
        trailingSlash: true,
        ...(pagesBasePath ? { basePath: pagesBasePath } : {}),
      }
    : {
        outputFileTracingIncludes: {
          '/': [
            './node_modules/async-function/require.mjs',
            './node_modules/async-generator-function/require.mjs',
            './node_modules/generator-function/require.mjs',
          ],
        },
      }),
  transpilePackages: ['@mui/material', '@mui/system', '@mui/styles', '@mui/icons-material'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Static export (GitHub Pages) does not support rewrites; the live app always runs server-side.
  ...(!isGitHubPages && {
    async rewrites() {
      const daycareApiOrigin = process.env.DAYCARE_API_ORIGIN || 'https://inhousecloudsolutions.com';
      return [
        {
          source: '/daycare-api/:path*',
          destination: `${daycareApiOrigin}/api/:path*`,
        },
      ];
    },
  }),
  images: {
    unoptimized: isGitHubPages,
  },
};

module.exports = withPlugins([withImages], config);
