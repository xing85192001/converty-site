import type { MetadataRoute } from "next";

// Required for Next.js static export mode
export const dynamic = "force-static";

/**
 * PWA Manifest Configuration
 *
 * This manifest enables "Add to Home Screen" installation for Converty.
 * Next.js automatically serves this at /manifest.webmanifest
 *
 * References:
 * - Next.js manifest: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest
 * - Web App Manifest spec: https://w3c.github.io/manifest/
 * - Maskable icons: https://web.dev/maskable-icon/
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Converty - Calculators & Converters",
    short_name: "Converty",
    description:
      "200+ free online calculators and converters for finance, health, math, photo, video, and more",
    id: "/converty/",
    start_url: "/converty/",
    scope: "/converty/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/converty/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/converty/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/converty/icons/icon-192-maskable.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/converty/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
