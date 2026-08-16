import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
