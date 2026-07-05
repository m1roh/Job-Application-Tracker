import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@job-tracker/core", "@job-tracker/infrastructure", "@job-tracker/design-tokens"],
};

export default nextConfig;
