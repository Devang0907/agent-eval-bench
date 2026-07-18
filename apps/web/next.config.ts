import type { NextConfig } from "next";

const apiInternal = process.env.API_INTERNAL_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${apiInternal}/api/auth/:path*`,
      },
      {
        source: "/v1/:path*",
        destination: `${apiInternal}/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
