import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: "standalone",
  
  // Enable experimental features if needed
  experimental: {
    // serverComponentsExternalPackages: ["@react-pdf/renderer"],
  },
};

export default withNextIntl(nextConfig);
