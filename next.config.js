/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    // See https://github.com/WalletConnect/walletconnect-monorepo/issues/1908
    config.externals.push('pino-pretty', 'lokijs', 'encoding');

    // See https://github.com/rainbow-me/rainbowkit/blob/371c9887e4d7989252702d6eaa8b489399616bd2/examples/with-next/next.config.js
    config.resolve.fallback = { fs: false, net: false, tls: false };

    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg')
    );
    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        resourceQuery: { not: /url/ }, // exclude if *.svg?url
        use: [
          {
            loader: '@svgr/webpack',
            options: { template: require('./src/utils/svgr.template') },
          },
        ],
      }
    );
    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
};

module.exports = nextConfig;
