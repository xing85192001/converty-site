/**
 * Site / publisher configuration.
 *
 * AdSense: set NEXT_PUBLIC_ADSENSE_CLIENT_ID in your .env (e.g. ca-pub-1234567890)
 * to enable ad scripts. Until then nothing ad-related is rendered.
 *
 * Publisher identity: AdSense requires a real, verifiable operator. Edit the
 * `operator` block below with your genuine details. They are shown on the
 * About and Contact pages so the reviewer can confirm who runs the site.
 */
export const siteConfig = {
  // Canonical site URL. Used for sitemap, robots, canonical/OG tags.
  // Override per-environment (e.g. Vercel) with NEXT_PUBLIC_SITE_URL.
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://allcalc.cc.cd",

  adsenseClientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? "",

  // Manual ad-unit slot ids (created in the AdSense dashboard AFTER approval).
  // Leave empty until you have real slots; AdUnit then shows a neutral placeholder
  // instead of throwing a "missing ad slot" console error.
  adSlots: {
    "content-top": "",
    "content-mid": "",
    "content-bottom": "",
  },

  operator: {
    name: "baikecalc",
    organization: "baikecalc",
    // Prefer a domain email (e.g. contact@baikecalc.com) over a personal one.
    email: "xingxing85192001@gmail.com",
    privacyEmail: "85192001@qq.com",
    country: "United States",
    foundedYear: 2026,
  },
} as const;

export type SiteConfig = typeof siteConfig;
