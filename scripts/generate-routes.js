#!/usr/bin/env node

/**
 * Routes Manifest Generator
 *
 * Scans the app directory for all page.tsx files and generates a JSON manifest
 * with route metadata including category, converter ID, and available locales.
 *
 * Usage:
 *   node scripts/generate-routes.js              # Generate routes.json
 *   node scripts/generate-routes.js --output=out # Custom output directory
 */

const fs = require("node:fs");
const path = require("node:path");

// Configuration
const LOCALES = ["en", "fr", "de", "it"];
const APP_DIR = path.join(process.cwd(), "src/app/[locale]");
const DEFAULT_OUTPUT = path.join(process.cwd(), "routes.json");

// Colors for terminal output
const colors = {
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  reset: "\x1b[0m",
};

// Parse command line arguments
const args = process.argv.slice(2);
const outputArg = args.find((arg) => arg.startsWith("--output="));
const outputPath = outputArg ? outputArg.split("=")[1] : DEFAULT_OUTPUT;

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
      pages.push(basePath || "/");
    }
  }

  return pages;
}

/**
 * Parse route path to extract category and converter info
 */
function parseRoute(routePath) {
  const parts = routePath.split("/").filter(Boolean);

  if (parts.length === 0) {
    return {
      path: "/",
      type: "home",
      category: null,
      converter: null,
    };
  }

  if (parts.length === 1) {
    return {
      path: `/${parts[0]}`,
      type: "category",
      category: parts[0],
      converter: null,
    };
  }

  return {
    path: `/${parts.join("/")}`,
    type: "converter",
    category: parts[0],
    converter: parts.slice(1).join("/"),
  };
}

/**
 * Generate the routes manifest
 */
function generateManifest() {
  console.log(`${colors.cyan}Generating routes manifest...${colors.reset}\n`);

  // Find all pages
  const pagePaths = findPageFiles(APP_DIR);

  console.log(`Found ${pagePaths.length} routes\n`);

  // Build manifest
  const manifest = {
    generated: new Date().toISOString(),
    locales: LOCALES,
    totalRoutes: pagePaths.length,
    totalLocalizedRoutes: pagePaths.length * LOCALES.length,
    routes: [],
    byCategory: {},
  };

  // Process each route
  for (const pagePath of pagePaths) {
    const parsed = parseRoute(pagePath);

    const route = {
      ...parsed,
      locales: LOCALES,
      localizedPaths: LOCALES.map((locale) => ({
        locale,
        path: `/${locale}${parsed.path === "/" ? "" : parsed.path}`,
      })),
    };

    manifest.routes.push(route);

    // Group by category
    if (parsed.category) {
      if (!manifest.byCategory[parsed.category]) {
        manifest.byCategory[parsed.category] = [];
      }
      manifest.byCategory[parsed.category].push(route);
    }
  }

  // Sort routes alphabetically
  manifest.routes.sort((a, b) => a.path.localeCompare(b.path));

  // Sort categories alphabetically
  manifest.byCategory = Object.fromEntries(
    Object.entries(manifest.byCategory).sort(([a], [b]) => a.localeCompare(b))
  );

  return manifest;
}

/**
 * Main function
 */
function main() {
  const manifest = generateManifest();

  // Write manifest to file
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2), "utf-8");

  console.log(`${colors.green}Routes manifest generated:${colors.reset} ${outputPath}`);
  console.log(`  Total routes: ${manifest.totalRoutes}`);
  console.log(`  Localized routes: ${manifest.totalLocalizedRoutes}`);
  console.log(`  Categories: ${Object.keys(manifest.byCategory).length}`);

  // Print category summary
  console.log(`\n${colors.cyan}Routes by category:${colors.reset}`);
  for (const [category, routes] of Object.entries(manifest.byCategory)) {
    console.log(`  ${category}: ${routes.length} routes`);
  }
}

main();
