import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { siteConfig } from "@/config/site";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: "baikecalc - Free online calculators and converters",
    template: "%s | baikecalc",
  },
  description:
    "Free online calculators and converters for finance, health, math, photo, video, and more.",
  openGraph: {
    type: "website",
    siteName: "baikecalc",
    title: "baikecalc - Free online calculators and converters",
    description:
      "Free online calculators and converters for finance, health, math, photo, video, and more.",
    locale: "en_US",
    images: [{ url: "/logo.jpg", width: 512, height: 512, alt: "baikecalc" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "baikecalc - Free online calculators and converters",
    description:
      "Free online calculators and converters for finance, health, math, photo, video, and more.",
    images: ["/logo.jpg"],
  },
  icons: {
    icon: [
      { url: "/logo.jpg", type: "image/jpeg" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

// Google Consent Mode v2 default — must run before any ad/analytics script so
// that ad_storage etc. start denied and only upgrade after the visitor chooses.
// EEA visitors therefore never receive personalized ads without consent.
const GOOGLE_CONSENT_DEFAULT = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});`;

const adsClientId = siteConfig.adsenseClientId;

// Pre-hydration service-worker cleanup. Unregisters any leftover service worker
// (e.g. the old sw-v7.js) and clears stale caches so it cannot claim clients
// during React hydration. IMPORTANT: no `location.reload()` — the reload loop
// here previously clobbered hydration and broke video/image tool pages.
const SW_CLEANUP = `(function(){try{if(!('serviceWorker' in navigator))return;navigator.serviceWorker.getRegistrations().then(function(regs){if(!regs||!regs.length)return;Promise.all(regs.map(function(r){return r.unregister().catch(function(){});})).then(function(){if(window.caches&&window.caches.keys){return window.caches.keys().then(function(keys){return Promise.all(keys.map(function(key){return window.caches.delete(key).catch(function(){});}));});}}).catch(function(){});}).catch(function(){});}catch(e){}})();`;

// 结构化数据：在每页注入 Organization + WebSite 实体，帮助 Google 将 "baikecalc" 识别为品牌实体，提升纯品牌词（不带 .com）的搜索召回。
const SITE_HREF = siteConfig.siteUrl.replace(/\/$/, "");
const brandJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_HREF}/#organization`,
      name: siteConfig.operator.organization,
      url: SITE_HREF,
      logo: `${SITE_HREF}/logo.jpg`,
      email: siteConfig.operator.email,
      sameAs: [],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_HREF}/#website`,
      url: SITE_HREF,
      name: siteConfig.operator.name,
      description:
        "Free online calculators and converters for finance, health, math, photo, video, and more.",
      publisher: { "@id": `${SITE_HREF}/#organization` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Script id="sw-cleanup" strategy="beforeInteractive">
          {SW_CLEANUP}
        </Script>
        <Script id="google-consent-default" strategy="beforeInteractive">
          {GOOGLE_CONSENT_DEFAULT}
        </Script>
        {adsClientId ? (
          <Script
            id="adsbygoogle"
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsClientId}`}
            crossOrigin="anonymous"
          />
        ) : null}
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(brandJsonLd) }}
        />
      </body>
    </html>
  );
}
