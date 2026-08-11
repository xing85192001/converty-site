#!/usr/bin/env node

/**
 * Sitemap Generator
 *
 * Generates a sitemap.xml file with all routes for all locales.
 * Includes lastmod, priority, and changefreq for SEO optimization.
 *
 * Usage:
 *   node scripts/generate-sitemap.js                    # Generate sitemap
 *   node scripts/generate-sitemap.js --base-url=https://example.com
 */

const fs = require("node:fs");
const path = require("node:path");

// Configuration
const LOCALES = ["en", "fr", "de", "it"];
const DEFAULT_LOCALE = "en";
const APP_DIR = path.join(process.cwd(), "src/app/[locale]");
const OUTPUT_PATH = path.join(process.cwd(), "public/sitemap.xml");

// Parse command line arguments
const args = process.argv.slice(2);
const baseUrlArg = args.find((arg) => arg.startsWith("--base-url="));
const BASE_URL = baseUrlArg ? baseUrlArg.split("=")[1] : "https://converty.app";

// Colors for terminal output
const colors = {
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  reset: "\x1b[0m",
};

/**
 * Recursively find all page.tsx files
 */
function findPageFiles(dir, basePath = "") {
  const pages = [];

  if (!fs.existsSync(dir)) {
    return pages;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip special Next.js directories
      if (entry.name.startsWith("_") || entry.name.startsWith(".")) {
        continue;
      }

      const newBasePath = basePath ? `${basePath}/${entry.name}` : entry.name;
      pages.push(...findPageFiles(fullPath, newBasePath));
    } else if (entry.name === "page.tsx" || entry.name === "page.ts") {
      pages.push(basePath || "");
    }
  }

  return pages;
}

/**
 * Get priority based on route depth and type
 */
function getPriority(routePath) {
  const parts = routePath.split("/").filter(Boolean);

  if (parts.length === 0) {
    return "1.0"; // Home page
  }
  if (parts.length === 1) {
    return "0.8"; // Category pages
  }
  return "0.6"; // Converter pages
}

/**
 * Get change frequency based on route type
 */
function getChangeFreq(routePath) {
  const parts = routePath.split("/").filter(Boolean);

  if (parts.length === 0) {
    return "weekly"; // Home page
  }
  if (parts.length === 1) {
    return "weekly"; // Category pages
  }
  return "monthly"; // Converter pages (content is stable)
}

/**
 * Generate sitemap XML
 */
function generateSitemap() {
  console.log(`${colors.cyan}Generating sitemap...${colors.reset}\n`);

  // Find all pages
  const pagePaths = findPageFiles(APP_DIR);
  const today = new Date().toISOString().split("T")[0];

  console.log(`Found ${pagePaths.length} routes`);
  console.log(
    `Generating ${pagePaths.length * LOCALES.length} URLs for ${LOCALES.length} locales\n`
  );

  // Build XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

  // Sort pages for consistent output
  pagePaths.sort();

  for (const pagePath of pagePaths) {
    for (const locale of LOCALES) {
      const urlPath = pagePath ? `/${locale}/${pagePath}` : `/${locale}`;
      const fullUrl = `${BASE_URL}${urlPath}`;
      const priority = getPriority(pagePath);
      const changefreq = getChangeFreq(pagePath);

      xml += "  <url>\n";
      xml += `    <loc>${fullUrl}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${changefreq}</changefreq>\n`;
      xml += `    <priority>${priority}</priority>\n`;

      // Add hreflang alternates for all locales
      for (const altLocale of LOCALES) {
        const altPath = pagePath ? `/${altLocale}/${pagePath}` : `/${altLocale}`;
        const altUrl = `${BASE_URL}${altPath}`;
        xml += `    <xhtml:link rel="alternate" hreflang="${altLocale}" href="${altUrl}" />\n`;
      }

      // Add x-default hreflang pointing to default locale
      const defaultPath = pagePath ? `/${DEFAULT_LOCALE}/${pagePath}` : `/${DEFAULT_LOCALE}`;
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}${defaultPath}" />\n`;

      xml += "  </url>\n";
    }
  }

  xml += "</urlset>\n";

  return { xml, totalUrls: pagePaths.length * LOCALES.length };
}

/**
 * Main function
 */
function main() {
  const { xml, totalUrls } = generateSitemap();

  // Ensure public directory exists
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write sitemap
  fs.writeFileSync(OUTPUT_PATH, xml, "utf-8");

  console.log(`${colors.green}Sitemap generated:${colors.reset} ${OUTPUT_PATH}`);
  console.log(`  Total URLs: ${totalUrls}`);
  console.log(`  Base URL: ${BASE_URL}`);
}

main();
