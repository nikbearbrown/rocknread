import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No server features are used. The whole assessment runs in the browser,
  // which is why this deploys to Vercel (or any static host) with no config.
  reactStrictMode: true,
};

export default nextConfig;
