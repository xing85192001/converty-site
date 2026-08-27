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
  // Pin Turbopack workspace root to this project so it does not walk up to
  // C:\Users\admin\Desktop\package-lock.json and mis-detect the root.
  turbopack: {
    root: __dirname,
  },
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
  // Allow cross-origin requests in development (customizable via ALLOWED_DEV_ORIGINS env)
  allowedDevOrigins: process.env.ALLOWED_DEV_ORIGINS
    ? process.env.ALLOWED_DEV_ORIGINS.split(",")
    : undefined,
  // Prevent browsers from caching /sw.js so the PWA always checks for updates.
  async headers() {
    return [
      {
        source: "/sw-v8.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
