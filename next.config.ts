import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["yahoo-finance2"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
