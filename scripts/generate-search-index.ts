/**
 * Build-time script to generate locale-specific search indexes.
 *
 * Run: npx tsx scripts/generate-search-index.ts
 * Output: public/search/index-{locale}.json (4 files)
 */

import * as fs from "node:fs";
import * as path from "node:path";
import Fuse from "fuse.js";
import type { SearchDocument } from "../src/lib/search/search-data";

// Locales to generate indexes for
const LOCALES = ["en", "fr", "de", "it"] as const;

// Fuse.js keys for search - must match runtime options
const FUSE_KEYS = ["name", "description", "keywords", "categoryName"];

interface TranslationFile {
  converter?: Record<string, { name?: string; description?: string }>;
  nav?: Record<string, { name?: string }>;
}

interface ConverterEntry {
  id: string;
  slug: string;
  category: string;
  keywords: string[];
}

function loadConverters(): ConverterEntry[] {
  // Dynamically import all converter registries and extract metadata
  // We read the compiled JS or use require for simplicity in the script
  const registryFiles = [
    "automotive-converters",
    "color-converters",
    "cooking-converters",
    "crypto-converters",
    "data-converters",
    "datetime-converters",
    "finance-converters",
    "health-converters",
    "math-converters",
    "music-converters",
    "network-converters",
    "photo-converters",
    "physics-converters",
    "realestate-converters",
    "video-converters",
    "web-converters",
  ];

  const converters: ConverterEntry[] = [];

  for (const file of registryFiles) {
    const filePath = path.join(process.cwd(), "src/lib/registry", `${file}.ts`);
    const content = fs.readFileSync(filePath, "utf-8");

    // Extract converter objects from the file using regex
    // Pattern: id: "...", slug: "...", category: "...", keywords: [...]
    const converterPattern =
      /{\s*id:\s*"([^"]+)",\s*slug:\s*"([^"]+)",\s*category:\s*"([^"]+)"[^}]*keywords:\s*\[([^\]]*)\]/g;

    const matches = content.matchAll(converterPattern);
    for (const match of matches) {
      const [, id, slug, category, keywordsStr] = match;
      // Parse keywords array
      const keywords = keywordsStr
        .split(",")
        .map((k) => k.trim().replace(/"/g, ""))
        .filter((k) => k.length > 0);

      converters.push({ id, slug, category, keywords });
    }
  }

  console.log(`Found ${converters.length} converters in registry`);
  return converters;
}

function loadTranslations(locale: string): TranslationFile {
  const filePath = path.join(process.cwd(), "src/messages", `${locale}.json`);
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content) as TranslationFile;
}

function generateSearchDocuments(
  converters: ConverterEntry[],
  translations: TranslationFile
): SearchDocument[] {
  const documents: SearchDocument[] = [];

  for (const converter of converters) {
    const converterTranslation = translations.converter?.[converter.id];
    const categoryTranslation = translations.nav?.[converter.category];

    // Skip if no translation found (shouldn't happen but be safe)
    if (!converterTranslation?.name) {
      console.warn(`Missing translation for converter: ${converter.id}`);
      continue;
    }

    documents.push({
      id: converter.id,
      slug: converter.slug,
      category: converter.category,
      categoryName: categoryTranslation?.name ?? converter.category,
      name: converterTranslation.name,
      description: converterTranslation.description ?? "",
      keywords: converter.keywords,
      href: `/${converter.category}/${converter.slug}`,
    });
  }

  return documents;
}

function generateIndex(locale: string, converters: ConverterEntry[]): void {
  console.log(`Generating search index for locale: ${locale}`);

  const translations = loadTranslations(locale);
  const documents = generateSearchDocuments(converters, translations);

  console.log(`  - ${documents.length} documents`);

  // Create Fuse.js index
  const index = Fuse.createIndex(FUSE_KEYS, documents);

  // Prepare output
  const output = {
    documents,
    index: index.toJSON(),
  };

  // Write to public/search/
  const outputDir = path.join(process.cwd(), "public/search");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, `index-${locale}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(output), "utf-8");

  console.log(`  - Written to: ${outputPath}`);
}

function main(): void {
  console.log("Generating search indexes...\n");

  const converters = loadConverters();

  for (const locale of LOCALES) {
    generateIndex(locale, converters);
  }

  console.log("\nDone! Search indexes generated.");
}

main();
