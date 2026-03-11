import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["yahoo-finance2"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
