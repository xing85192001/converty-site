#!/usr/bin/env node

/**
 * i18n Translation Key Checker
 *
 * Scans source files for translation key usage and compares against
 * translation files to detect missing keys.
 *
 * Usage:
 *   node scripts/check-i18n.js          # Check for missing keys
 *   node scripts/check-i18n.js --sync   # Check sync across locales
 *   node scripts/check-i18n.js --verbose # Show detailed output
 */

const fs = require("node:fs");
const path = require("node:path");

// Configuration
const LOCALES = ["en", "fr", "de", "it"];
const MESSAGES_DIR = path.join(process.cwd(), "src/messages");
const SOURCE_DIRS = [
  path.join(process.cwd(), "src/app"),
  path.join(process.cwd(), "src/components"),
];

// Colors for terminal output
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  reset: "\x1b[0m",
};

// Parse command line arguments
const args = process.argv.slice(2);
const syncMode = args.includes("--sync");
const verboseMode = args.includes("--verbose");

/**
 * Recursively get all files with given extensions
 */
function getFiles(dir, extensions = [".tsx", ".ts"]) {
  const files = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules and hidden directories
      if (!entry.name.startsWith(".") && entry.name !== "node_modules") {
        files.push(...getFiles(fullPath, extensions));
      }
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Extract translation keys from source code
 */
function extractKeysFromSource(content, _filePath) {
  const keys = new Set();

  // First, find all namespace declarations
  // e.g., const t = useTranslations("calculator");
  const namespacePattern = /const\s+(\w+)\s*=\s*useTranslations\s*\(\s*["']([^"']+)["']\s*\)/g;
  const namespaces = new Map(); // variable name -> namespace

  let match = namespacePattern.exec(content);
  while (match !== null) {
    const varName = match[1];
    const namespace = match[2];
    namespaces.set(varName, namespace);
    match = namespacePattern.exec(content);
  }

  // Also check for getTranslations calls
  const getTranslationsPattern =
    /(?:const\s+(\w+)\s*=\s*)?(?:await\s+)?getTranslations\s*\(\s*(?:\{\s*locale,?\s*namespace:\s*)?["']([^"']+)["']\s*\)?/g;
  match = getTranslationsPattern.exec(content);
  while (match !== null) {
    const varName = match[1] || "t";
    const namespace = match[2];
    namespaces.set(varName, namespace);
    match = getTranslationsPattern.exec(content);
  }

  // Now extract translation key usage
  // Match: t("key"), tLabels("key"), etc.
  const keyPattern = /\b(\w+)\s*\(\s*["']([^"']+)["']\s*(?:,\s*\{[^}]*\})?\s*\)/g;

  match = keyPattern.exec(content);
  while (match !== null) {
    const varName = match[1];
    const key = match[2];

    // Filter out obvious false positives
    // Skip numeric values, URLs, coordinates, etc.
    if (/^-?\d+\.?\d*$/.test(key)) {
      match = keyPattern.exec(content);
      continue; // Numbers like "5.6", "-74.0060"
    }
    if (/^https?:\/\//.test(key)) {
      match = keyPattern.exec(content);
      continue; // URLs
    }
    if (/^v=spf1/.test(key)) {
      match = keyPattern.exec(content);
      continue; // SPF records
    }
    if (key.length > 100) {
      match = keyPattern.exec(content);
      continue; // Very long strings are unlikely to be translation keys
    }

    // Check if this variable is a known translation function
    if (namespaces.has(varName)) {
      const namespace = namespaces.get(varName);
      // Only combine if the key has a dot (is a sub-key)
      if (key.includes(".")) {
        keys.add(`${namespace}.${key}`);
      }
      // For namespace-only calls like useTranslations("calculator")
      // Don't add them as they're just namespace declarations
    } else {
      // Unknown function, might still be a translation call
      // Add it as-is if it looks like a translation key
      if (key.includes(".")) {
        keys.add(key);
      }
    }

    match = keyPattern.exec(content);
  }

  return keys;
}

/**
 * Flatten nested JSON object to dot notation keys
 */
function flattenObject(obj, prefix = "") {
  const keys = {};

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(keys, flattenObject(value, fullKey));
    } else {
      keys[fullKey] = value;
    }
  }

  return keys;
}

/**
 * Get all keys from a nested object at a specific namespace
 */
function _getKeysAtNamespace(obj, namespace) {
  const parts = namespace.split(".");
  let current = obj;

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      return new Set();
    }
  }

  if (current && typeof current === "object") {
    return new Set(Object.keys(flattenObject(current)));
  }

  return new Set();
}

/**
 * Load all translation files
 */
function loadTranslations() {
  const translations = {};

  for (const locale of LOCALES) {
    const filePath = path.join(MESSAGES_DIR, `${locale}.json`);

    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, "utf-8");
        translations[locale] = JSON.parse(content);
      } catch (error) {
        console.error(`${colors.red}Error loading ${filePath}: ${error.message}${colors.reset}`);
        translations[locale] = {};
      }
    } else {
      console.error(
        `${colors.yellow}Warning: Translation file not found: ${filePath}${colors.reset}`
      );
      translations[locale] = {};
    }
  }

  return translations;
}

/**
 * Check if a key exists in translations
 */
function keyExists(translations, locale, key) {
  const parts = key.split(".");
  let current = translations[locale];

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      return false;
    }
  }

  return true;
}

/**
 * Check for missing keys across locales (sync mode)
 */
function checkSync(translations) {
  console.log(`\n${colors.cyan}Checking translation sync across locales...${colors.reset}\n`);

  const allKeys = new Set();
  const keysByLocale = {};

  // Collect all keys from all locales
  for (const locale of LOCALES) {
    const flatKeys = flattenObject(translations[locale]);
    keysByLocale[locale] = new Set(Object.keys(flatKeys));

    for (const key of Object.keys(flatKeys)) {
      allKeys.add(key);
    }
  }

  // Find keys missing in each locale
  let hasIssues = false;

  for (const locale of LOCALES) {
    const missing = [];

    for (const key of allKeys) {
      if (!keysByLocale[locale].has(key)) {
        missing.push(key);
      }
    }

    if (missing.length > 0) {
      hasIssues = true;
      console.log(`${colors.yellow}[${locale}] Missing ${missing.length} keys:${colors.reset}`);

      for (const key of missing.slice(0, 20)) {
        console.log(`  - ${key}`);
      }

      if (missing.length > 20) {
        console.log(`  ... and ${missing.length - 20} more`);
      }

      console.log();
    }
  }

  if (!hasIssues) {
    console.log(`${colors.green}All locales are in sync!${colors.reset}`);
  }

  return !hasIssues;
}

/**
 * Main check function
 */
function main() {
  console.log(`${colors.cyan}i18n Translation Key Checker${colors.reset}`);
  console.log("=".repeat(40));

  // Load translations
  const translations = loadTranslations();

  if (syncMode) {
    const success = checkSync(translations);
    process.exit(success ? 0 : 1);
  }

  // Scan source files
  console.log(`\n${colors.cyan}Scanning source files...${colors.reset}`);

  const usedKeys = new Set();
  const keyLocations = {};

  for (const sourceDir of SOURCE_DIRS) {
    const files = getFiles(sourceDir);

    for (const file of files) {
      const content = fs.readFileSync(file, "utf-8");
      const keys = extractKeysFromSource(content, file);

      for (const key of keys) {
        usedKeys.add(key);

        if (!keyLocations[key]) {
          keyLocations[key] = [];
        }
        keyLocations[key].push(path.relative(process.cwd(), file));
      }
    }
  }

  if (verboseMode) {
    console.log(`Found ${usedKeys.size} unique translation keys in source files`);
  }

  // Check each locale for missing keys
  console.log(`\n${colors.cyan}Checking for missing keys...${colors.reset}\n`);

  let hasErrors = false;
  const missingByLocale = {};

  for (const locale of LOCALES) {
    const missing = [];

    for (const key of usedKeys) {
      // Skip namespace-only keys (like "calculator", "common", etc.)
      // These are used with useTranslations() to get a namespace
      if (!key.includes(".")) {
        continue;
      }

      if (!keyExists(translations, locale, key)) {
        missing.push(key);
      }
    }

    missingByLocale[locale] = missing;

    if (missing.length > 0) {
      hasErrors = true;
      console.log(`${colors.red}[${locale}] Missing ${missing.length} keys:${colors.reset}`);

      for (const key of missing.slice(0, 30)) {
        console.log(`  - ${key}`);

        if (verboseMode && keyLocations[key]) {
          for (const location of keyLocations[key].slice(0, 2)) {
            console.log(`    ${colors.yellow}used in: ${location}${colors.reset}`);
          }
        }
      }

      if (missing.length > 30) {
        console.log(`  ... and ${missing.length - 30} more`);
      }

      console.log();
    } else {
      console.log(`${colors.green}[${locale}] All keys present${colors.reset}`);
    }
  }

  // Summary
  console.log(`\n${"=".repeat(40)}`);

  if (hasErrors) {
    console.log(`${colors.red}Translation check failed!${colors.reset}`);
    console.log("Missing keys need to be added to translation files.");
    process.exit(1);
  } else {
    console.log(`${colors.green}All translation keys are present!${colors.reset}`);
    process.exit(0);
  }
}

main();
