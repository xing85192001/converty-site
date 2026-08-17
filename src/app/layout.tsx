import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { siteConfig } from "@/config/site";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "baikecalc - Free online calculators and converters",
  description:
    "Free online calculators and converters for finance, health, math, photo, video, and more.",
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

// Pre-hydration service-worker cleanup. Loaded with beforeInteractive and
// inlined (not via a separate public/ file) so it always ships with the HTML
// and is never served stale from a cached public asset. It unregisters every
// service-worker registration, deletes every cache, then reloads once per
// session — this stops the old sw-v7.js from claiming clients during React
// hydration and triggering the "Minified React error #418" / insertBefore crash.
const SW_CLEANUP = `(function(){try{if(!('serviceWorker' in navigator))return;var k='sw-cleanup-v9';navigator.serviceWorker.getRegistrations().then(function(regs){if(!regs||!regs.length)return;Promise.all(regs.map(function(r){return r.unregister().catch(function(){});})).then(function(){if(window.caches&&window.caches.keys){return window.caches.keys().then(function(keys){return Promise.all(keys.map(function(key){return window.caches.delete(key).catch(function(){});}));});}}).then(function(){try{if(!sessionStorage.getItem(k)){sessionStorage.setItem(k,'1');location.reload();}}catch(e){}}).catch(function(){});}).catch(function(){});}catch(e){}})();`;

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
      </body>
    </html>
  );
}
