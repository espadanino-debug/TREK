import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    // French is the primary language.
    return [{ source: "/", destination: "/fr", permanent: false }];
  },
};

export default nextConfig;
