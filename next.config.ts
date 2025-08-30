import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  // Ensure proper handling of trailing slashes
  trailingSlash: false,
  // Enable static exports if needed
  images: {
    unoptimized: true,
  },
};

export default nextConfig