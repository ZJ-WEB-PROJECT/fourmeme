/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: generates plain HTML/CSS/JS files — upload to any web host (Nginx, BaoTa).
  output: 'export',
  trailingSlash: true,       // /swap → /swap/index.html, works on any static server
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,   // skip type errors during CI build
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@rainbow-me/rainbowkit',
      'viem',
    ],
    turbo: {
      // Turbopack resolveAlias: relative path from project root.
      // Stubs out packages that pull in Stencil/webpack magic comments
      // or Node-only / React-Native-only modules that break Turbopack.
      resolveAlias: {
        '@metamask/sdk':                              './empty-module.js',
        '@metamask/sdk-install-modal-web':            './empty-module.js',
        'pino-pretty':                                './empty-module.js',
        encoding:                                     './empty-module.js',
        '@react-native-async-storage/async-storage':  './empty-module.js',
        '@react-native-community/netinfo':             './empty-module.js',
        'react-native':                               './empty-module.js',
      },
    },
  },
  // Webpack aliases (used when running without --turbo)
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false, net: false, tls: false, crypto: false,
    };
    config.resolve.alias = {
      ...config.resolve.alias,
      '@metamask/sdk':                              false,
      '@metamask/sdk-install-modal-web':            false,
      'pino-pretty':                                false,
      encoding:                                     false,
      '@react-native-async-storage/async-storage':  false,
      '@react-native-community/netinfo':            false,
      'react-native':                               false,
    };
    return config;
  },
};

export default nextConfig;
