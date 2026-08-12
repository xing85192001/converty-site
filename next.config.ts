import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

import withBundleAnalyzerFactory from "@next/bundle-analyzer";

const withBundleAnalyzer = withBundleAnalyzerFactory({
  enabled: process.env.ANALYZE === "true",
});

const isProd = process.env.NODE_ENV === "production";

// Production base path.
//  - Default: "" (root domain) -> deploy at a domain root (https://yourdomain.com/)
//  - Set BASE_PATH="/converty" -> deploy under a sub-path (e.g. GitHub Pages project site)
const basePath = process.env.BASE_PATH !== undefined ? process.env.BASE_PATH : "";

const nextConfig: NextConfig = {
  // Build artifacts dir (overridable via env var for build tooling)
  distDir: process.env.BUILD_DIR ?? ".next",
  // Static export for production (used by Vercel / static hosts)
  ...(isProd && { output: "export" }),
  // Force trailing slashes for GitHub Pages compatibility
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Base path for static hosting. Controlled via BASE_PATH env (see above).
  basePath: basePath,
  assetPrefix: basePath,
  // Allow cross-origin requests in development
  allowedDevOrigins: ["172.16.86.102"],
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
