import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Converty - Free online calculators and converters",
  description:
    "Free online calculators and converters for finance, health, math, photo, video, and more.",
  icons: {
    icon: [
      { url: "/converty/favicon.ico", sizes: "any" },
      { url: "/converty/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/converty/icons/apple-touch-icon.png",
  },
};

// Root layout - provides HTML structure
// The locale-specific layout is in [locale]/layout.tsx
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
