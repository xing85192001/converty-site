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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {/* Synchronous service-worker cleanup. Loaded with beforeInteractive so it
            runs BEFORE React hydration: a stale worker (e.g. sw-v7.js) cannot
            claim clients and trigger the "Minified React error #418" /
            insertBefore crash. Unregisters every registration, deletes every
            cache, then reloads once per session. */}
        <Script id="sw-cleanup" src="/sw-cleanup.js" strategy="beforeInteractive" />
        {children}
      </body>
    </html>
  );
}
