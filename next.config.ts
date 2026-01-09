import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  serverExternalPackages: ['@anthropic-ai/sdk'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent Anthropic SDK from being bundled in server components
      if (Array.isArray(config.externals)) {
        config.externals.push('@anthropic-ai/sdk');
      } else if (typeof config.externals === 'object') {
        config.externals = { ...config.externals, '@anthropic-ai/sdk': 'commonjs @anthropic-ai/sdk' };
      }
    }
    return config;
  },
};

export default nextConfig;
