"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { locales, defaultLocale } from "@/i18n/config";
import { siteConfig } from "@/config/site";

// Google-friendly hreflang codes. zh -> zh-Hans, zh-TW -> zh-Hant; the rest map
// to themselves. x-default always points at the default locale.
const HREFLANG: Record<string, string> = {
  en: "en",
  zh: "zh-Hans",
  "zh-TW": "zh-Hant",
  de: "de",
  ja: "ja",
  es: "es",
};
const hreflangFor = (locale: string): string => HREFLANG[locale] ?? locale;

/**
 * Injects <link rel="alternate" hreflang="..."> tags for every locale variant
 * of the CURRENT page into <head>.
 *
 * Why a client component: this site is a static export, so generateMetadata in
 * the [locale]/layout only knows the locale, not the concrete route. Reading
 * window.location.pathname at runtime lets us rewrite the locale segment for
 * every other language and emit correct per-page hreflang — which sitemap.xml
 * alone cannot guarantee Google will honor at the page level.
 */
export function HreflangTags() {
  const locale = useLocale();

  useEffect(() => {
    const SITE = siteConfig.siteUrl.replace(/\/$/, "");
    const pathname = window.location.pathname;

    // Strip the current locale prefix (/zh/..., /en/...) to get the route tail.
    const segments = pathname.split("/").filter(Boolean); // e.g. ["zh","finance","mortgage"]
    const routeTail =
      segments.length > 1 ? `/${segments.slice(1).join("/")}` : ""; // "/finance/mortgage" or ""

    const buildUrl = (l: string) =>
      `${SITE}/${l}${routeTail}${pathname.endsWith("/") ? "/" : ""}`;

    // Remove any previously injected tags (HMR / client nav safety).
    document
      .querySelectorAll('link[data-hreflang-auto]')
      .forEach((el) => el.remove());

    const head = document.head;
    const addLink = (hreflang: string, href: string) => {
      const link = document.createElement("link");
      link.rel = "alternate";
      link.setAttribute("hreflang", hreflang);
      link.href = href;
      link.setAttribute("data-hreflang-auto", "true");
      head.appendChild(link);
    };

    for (const l of locales) {
      if (l === locale) continue; // current page already has canonical/og
      addLink(hreflangFor(l), buildUrl(l));
    }
    // x-default -> default locale
    addLink("x-default", buildUrl(defaultLocale));
  }, [locale]);

  return null;
}
