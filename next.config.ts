import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark Anthropic SDK as external to prevent bundling issues during build
      config.externals = config.externals || [];
      config.externals.push('@anthropic-ai/sdk');
    }
    return config;
  },
};

export default nextConfig;
