import fs from "node:fs";
import path from "node:path";
import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { defaultLocale, locales } from "@/i18n/config";
import { blogPosts } from "@/lib/blog/posts";
import { categories } from "@/lib/registry/categories";
import { converterRegistry } from "@/lib/registry/converters";
import { mediaTools } from "@/lib/registry/media-tools";

const SITE = siteConfig.siteUrl.replace(/\/$/, "");

export const dynamic = "force-static";

// Google-friendly hreflang codes. zh -> zh-Hans, zh-TW -> zh-Hant; the rest map
// to themselves. x-default always points at the default locale.
const HREFLANG: Record<string, string> = {
  en: "en",
  zh: "zh-Hans",
  "zh-TW": "zh-Hant",
};
const hreflangFor = (locale: string): string => HREFLANG[locale] ?? locale;

const LOCALE_DIR = path.join(process.cwd(), "src/app/[locale]");

function locUrl(locale: string, route: string): string {
  // route: "" (home), "finance", "finance/mortgage", "blog", "blog/slug"
  const base = route ? `/${locale}/${route}` : `/${locale}`;
  return `${SITE}${base}/`; // trailing slash matches trailingSlash:true
}

function buildLanguages(route: string): Record<string, string> {
  const langs: Record<string, string> = {};
  for (const l of locales) langs[hreflangFor(l)] = locUrl(l, route);
  langs["x-default"] = locUrl(defaultLocale, route);
  return langs;
}

// Verify a category index page actually exists so we never emit soft-404 URLs.
function hasIndexPage(slug: string): boolean {
  return fs.existsSync(path.join(LOCALE_DIR, slug, "page.tsx"));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Home (per locale)
  for (const l of locales) {
    entries.push({
      url: locUrl(l, ""),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: { languages: buildLanguages("") },
    });
  }

  // "all" tools listing page
  if (hasIndexPage("all")) {
    for (const l of locales) {
      entries.push({
        url: locUrl(l, "all"),
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
        alternates: { languages: buildLanguages("all") },
      });
    }
  }

  // Category index pages
  for (const cat of categories) {
    if (!hasIndexPage(cat.slug)) continue;
    for (const l of locales) {
      entries.push({
        url: locUrl(l, cat.slug),
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
        alternates: { languages: buildLanguages(cat.slug) },
      });
    }
  }

  // Tool pages: /[locale]/[category]/[slug]
  const catSlugById = new Map(categories.map((c) => [c.id, c.slug]));
  for (const conv of Object.values(converterRegistry)) {
    const catSlug = catSlugById.get(conv.category);
    if (!catSlug || !conv.slug) continue;
    const route = `${catSlug}/${conv.slug}`;
    for (const l of locales) {
      entries.push({
        url: locUrl(l, route),
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: { languages: buildLanguages(route) },
      });
    }
  }

  // Media tool pages: /[locale]/tools/[slug]
  for (const tool of mediaTools) {
    const route = `tools/${tool.slug}`;
    for (const l of locales) {
      entries.push({
        url: locUrl(l, route),
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: { languages: buildLanguages(route) },
      });
    }
  }

  // Static informational pages
  const staticRoutes = ["about", "contact", "privacy-policy", "terms"];
  for (const r of staticRoutes) {
    for (const l of locales) {
      entries.push({
        url: locUrl(l, r),
        lastModified: new Date(),
        changeFrequency: "yearly",
        priority: 0.5,
        alternates: { languages: buildLanguages(r) },
      });
    }
  }

  // Blog list + individual posts
  for (const l of locales) {
    entries.push({
      url: locUrl(l, "blog"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
      alternates: { languages: buildLanguages("blog") },
    });
  }
  for (const post of blogPosts) {
    const route = `blog/${post.slug}`;
    for (const l of locales) {
      entries.push({
        url: locUrl(l, route),
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: { languages: buildLanguages(route) },
      });
    }
  }

  return entries;
}
