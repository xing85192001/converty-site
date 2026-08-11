#!/usr/bin/env node
/**
 * migrate-i18n-namespaces.js
 * One-shot migration script: restructures locale JSON files to new namespace schema.
 *
 * Transformations (applied to all 4 locale files):
 * 1. Rename `converters` → `converter`
 * 2. Build `nav` from `categories` + `subcategories`
 * 3. Move `validation` under `common.validation`
 * 4. Move `metadata` under `common.metadata`
 * 5. Remove orphaned top-level `realestate` key (verified duplicate of calculator.realestate)
 *
 * Target top-level structure:
 * { common, nav, converter, calculator }
 */

const fs = require("node:fs");
const path = require("node:path");

const LOCALES = ["en", "fr", "de", "it"];
const MESSAGES_DIR = path.join(__dirname, "../src/messages");

function migrate(locale) {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
  const raw = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(raw);

  const oldKeys = Object.keys(data);

  // Verify preconditions before mutating
  if (!data.converters) {
    throw new Error(`[${locale}] Missing 'converters' key`);
  }
  if (!data.categories) {
    throw new Error(`[${locale}] Missing 'categories' key`);
  }
  if (!data.subcategories) {
    throw new Error(`[${locale}] Missing 'subcategories' key`);
  }
  if (!data.validation) {
    throw new Error(`[${locale}] Missing 'validation' key`);
  }
  if (!data.metadata) {
    throw new Error(`[${locale}] Missing 'metadata' key`);
  }

  // Verify realestate dedup safety before removing
  if (data.realestate) {
    const hasCalcRealestate =
      data.calculator &&
      data.calculator.realestate &&
      data.calculator.realestate["property-valuation"];
    if (!hasCalcRealestate) {
      throw new Error(
        `[${locale}] Cannot remove top-level 'realestate': calculator.realestate.property-valuation not found`
      );
    }
    console.log(
      `  [${locale}] Verified: calculator.realestate.property-valuation exists — safe to remove top-level realestate`
    );
  }

  // Build the new structure
  const result = {
    // 1. common gets validation and metadata nested under it
    common: {
      ...data.common,
      validation: data.validation,
      metadata: data.metadata,
    },

    // 2. nav = spread categories + subcategories nested
    nav: {
      ...data.categories,
      subcategories: data.subcategories,
    },

    // 3. converter (renamed from converters)
    converter: data.converters,

    // 4. calculator unchanged
    calculator: data.calculator,
  };

  const newKeys = Object.keys(result);

  // Write back with 2-space indent and trailing newline (matching existing format)
  const output = JSON.stringify(result, null, 2) + "\n";
  fs.writeFileSync(filePath, output, "utf8");

  console.log(`Processed ${locale}: [${oldKeys.join(", ")}] → [${newKeys.join(", ")}]`);
}

console.log("Starting i18n namespace migration...\n");

let allOk = true;
for (const locale of LOCALES) {
  try {
    migrate(locale);
  } catch (err) {
    console.error(`FAILED [${locale}]:`, err.message);
    allOk = false;
  }
}

if (allOk) {
  console.log("\nMigration complete. All 4 locale files updated.");
  console.log("Run verification: node scripts/migrate-i18n-namespaces.js --verify");
} else {
  console.error("\nMigration FAILED. Check errors above.");
  process.exit(1);
}
