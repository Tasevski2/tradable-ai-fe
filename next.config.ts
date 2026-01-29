import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Acknowledge Turbopack + webpack coexistence
  // Lightweight Charts may need webpack fallback for fs module
  turbopack: {},

  // Lightweight Charts requires client-side only
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

export default nextConfig;
