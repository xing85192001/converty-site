/**
 * Fetch SPECint2017 Rate results from SPEC.org at build time
 *
 * Fetches: SPECrate2017_int_base and _peak scores for server CPUs
 * Source: SPEC.org public CSV dump (rint2017)
 * Enriches: CPU metadata (family, TDP, socket) from mapping table
 *
 * Usage: npx tsx scripts/fetch-spec-cpu-data.ts
 * Runs automatically via npm run prebuild
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { findCpuMetadata } from "./data/cpu-metadata";

// ── Types ────────────────────────────────────────────────────────────────────

interface SpecCsvRow {
  benchmark: string;
  hardwareVendor: string;
  system: string;
  cores: number;
  chips: number;
  threadsPerCore: number;
  processor: string;
  processorMhz: number;
  result: number; // Peak
  baseline: number; // Base
  hwAvail: string; // e.g. "Jun-2024"
}

interface CpuEntry {
  id: string;
  vendor: "intel" | "amd" | "arm";
  name: string;
  family: string;
  generation: "current" | "previous";
  cores: number;
  threadsPerCore: number;
  tdpW: number;
  socketType: string;
  specint2017Base: number;
  specint2017Peak: number;
  releaseYear: number;
  notes?: string;
}

interface CpuDatabase {
  dataAsOf: string;
  staleDays: number;
  staleWarning: string;
  source: string;
  cpus: CpuEntry[];
}

// ── CSV Parser ───────────────────────────────────────────────────────────────

/**
 * Minimal RFC 4180 CSV parser. Handles quoted fields with embedded commas.
 */
function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i += 2;
        } else {
          inQuotes = false;
          i++;
        }
      } else {
        current += ch;
        i++;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
      } else if (ch === ",") {
        fields.push(current.trim());
        current = "";
        i++;
      } else {
        current += ch;
        i++;
      }
    }
  }
  fields.push(current.trim());
  return fields;
}

function parseCSV(text: string): SpecCsvRow[] {
  // Split lines — handle \r\n
  const lines = text.split(/\r?\n/).filter((line) => line.length > 0);
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map((h) => h.replace(/[\t\s]+$/, "").toLowerCase());

  // Find column indices
  const colIdx = {
    benchmark: headers.indexOf("benchmark"),
    hardwareVendor: headers.findIndex((h) => h.includes("hardware vendor")),
    system: headers.indexOf("system"),
    cores: headers.indexOf("# cores"),
    chips: headers.indexOf("# chips"),
    threadsPerCore: headers.findIndex((h) => h.includes("threads per core")),
    processor: headers.indexOf("processor"),
    processorMhz: headers.findIndex((h) => h.includes("processor mhz")),
    result: headers.indexOf("result"),
    baseline: headers.indexOf("baseline"),
    hwAvail: headers.indexOf("hw avail"),
  };

  // Validate required columns exist
  const missing = Object.entries(colIdx)
    .filter(([, idx]) => idx === -1)
    .map(([name]) => name);
  if (missing.length > 0) {
    throw new Error(
      `Missing CSV columns: ${missing.join(", ")}. Headers found: ${headers.slice(0, 15).join(", ")}`
    );
  }

  const rows: SpecCsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);
    if (fields.length < 10) continue;

    const result = Number.parseFloat(fields[colIdx.result]);
    const baseline = Number.parseFloat(fields[colIdx.baseline]);

    // Skip rows with zero or invalid scores
    if (!result || result <= 0 || !baseline || baseline <= 0) continue;

    rows.push({
      benchmark: fields[colIdx.benchmark] || "",
      hardwareVendor: fields[colIdx.hardwareVendor] || "",
      system: fields[colIdx.system] || "",
      cores: Number.parseInt(fields[colIdx.cores], 10) || 0,
      chips: Number.parseInt(fields[colIdx.chips], 10) || 1,
      threadsPerCore: Number.parseInt(fields[colIdx.threadsPerCore], 10) || 2,
      processor: fields[colIdx.processor] || "",
      processorMhz: Number.parseInt(fields[colIdx.processorMhz], 10) || 0,
      result,
      baseline,
      hwAvail: fields[colIdx.hwAvail] || "",
    });
  }

  return rows;
}

// ── Vendor & ID derivation ───────────────────────────────────────────────────

const SERVER_CPU_PATTERNS = [
  /^Intel\s+Xeon/i,
  /^AMD\s+EPYC/i,
  /^Ampere/i,
  /^AWS\s+Graviton/i,
  /^Fujitsu\s+A64FX/i,
  /^HiSilicon\s+Kunpeng/i,
];

function isServerCpu(processor: string): boolean {
  return SERVER_CPU_PATTERNS.some((re) => re.test(processor));
}

function deriveVendor(processor: string): "intel" | "amd" | "arm" | null {
  if (/^Intel/i.test(processor)) return "intel";
  if (/^AMD/i.test(processor)) return "amd";
  if (/^Ampere|^AWS\s+Graviton|^Fujitsu\s+A64FX|^HiSilicon/i.test(processor)) return "arm";
  return null;
}

function toKebabId(processor: string): string {
  return processor
    .toLowerCase()
    .replace(/\+/g, "plus")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function parseReleaseYear(hwAvail: string): number {
  // Format: "Jun-2024" or "2024"
  const match = hwAvail.match(/(\d{4})/);
  return match ? Number.parseInt(match[1], 10) : 0;
}

// ── Grouping & best-score selection ──────────────────────────────────────────

interface CpuGroup {
  processor: string;
  submissions: SpecCsvRow[];
}

function groupByProcessor(rows: SpecCsvRow[]): Map<string, CpuGroup> {
  const groups = new Map<string, CpuGroup>();

  for (const row of rows) {
    // Normalize: trim, collapse spaces
    const name = row.processor.replace(/\s+/g, " ").trim();
    const key = name.toLowerCase();

    const existing = groups.get(key);
    if (existing) {
      existing.submissions.push(row);
    } else {
      groups.set(key, { processor: name, submissions: [row] });
    }
  }

  return groups;
}

function selectBestSubmission(group: CpuGroup): SpecCsvRow | null {
  const { submissions } = group;

  // Prefer single-chip submissions
  const singleChip = submissions.filter((s) => s.chips === 1);
  const candidates = singleChip.length > 0 ? singleChip : submissions;

  // Pick the one with the highest peak score
  let best: SpecCsvRow | null = null;
  for (const sub of candidates) {
    const score = singleChip.length > 0 ? sub.result : sub.result / sub.chips;
    const bestScore = best ? (singleChip.length > 0 ? best.result : best.result / best.chips) : 0;

    if (score > bestScore) {
      best = sub;
    }
  }

  return best;
}

// ── Main ─────────────────────────────────────────────────────────────────────

const SPEC_URL = "https://www.spec.org/cgi-bin/osgresults?conf=rint2017;op=dump;format=csvdump";
const OUTPUT_PATH = join(process.cwd(), "src", "lib", "data", "cpu-database.json");

async function fetchSpecData(): Promise<CpuDatabase> {
  console.log("Fetching SPECint2017 Rate results from SPEC.org...");

  const response = await fetch(SPEC_URL, {
    headers: {
      "User-Agent": "Converty/build (https://github.com/fjacquet/converty)",
      Accept: "text/csv, text/plain, */*",
    },
    signal: AbortSignal.timeout(90_000),
  });

  if (!response.ok) {
    throw new Error(`SPEC.org returned ${response.status}: ${response.statusText}`);
  }

  const csvText = await response.text();
  console.log(`✓ Downloaded ${(csvText.length / 1024).toFixed(0)} KB from SPEC.org`);

  // Parse CSV
  const allRows = parseCSV(csvText);
  console.log(`✓ Parsed ${allRows.length} total submissions`);

  // Filter to server CPUs
  const serverRows = allRows.filter((row) => isServerCpu(row.processor));
  console.log(`✓ Filtered to ${serverRows.length} server CPU submissions`);

  // Group by processor
  const groups = groupByProcessor(serverRows);
  console.log(`✓ Grouped into ${groups.size} unique processors`);

  // Build CPU entries
  const cpus: CpuEntry[] = [];
  let enrichedCount = 0;

  for (const group of groups.values()) {
    const best = selectBestSubmission(group);
    if (!best) continue;

    const vendor = deriveVendor(best.processor);
    if (!vendor) continue;

    const isMultiChipOnly = group.submissions.every((s) => s.chips > 1);
    const normalizedPeak = isMultiChipOnly
      ? Math.round((best.result / best.chips) * 10) / 10
      : best.result;
    const normalizedBase = isMultiChipOnly
      ? Math.round((best.baseline / best.chips) * 10) / 10
      : best.baseline;

    // Enrich with metadata
    const meta = findCpuMetadata(best.processor);
    if (meta) enrichedCount++;

    const entry: CpuEntry = {
      id: toKebabId(best.processor),
      vendor,
      name: best.processor,
      family: meta?.family ?? "Unknown",
      generation: meta?.generation ?? "current",
      cores: best.cores,
      threadsPerCore: best.threadsPerCore,
      tdpW: meta?.tdpW ?? 0,
      socketType: meta?.socketType ?? "Unknown",
      specint2017Base: normalizedBase,
      specint2017Peak: normalizedPeak,
      releaseYear: parseReleaseYear(best.hwAvail),
    };

    if (isMultiChipOnly) {
      entry.notes = `Score normalized from ${best.chips}-chip submission`;
    }

    cpus.push(entry);
  }

  // Sort by peak score descending
  cpus.sort((a, b) => b.specint2017Peak - a.specint2017Peak);

  console.log(
    `✓ Enriched ${enrichedCount} CPUs with metadata (${cpus.length - enrichedCount} with defaults)`
  );

  return {
    dataAsOf: new Date().toISOString().split("T")[0],
    staleDays: 90,
    staleWarning:
      "SPECint2017 data may be outdated. Verify current scores at spec.org before procurement decisions.",
    source: "https://www.spec.org/cpu2017/results/rint2017.html",
    cpus,
  };
}

async function main(): Promise<void> {
  try {
    const database = await fetchSpecData();

    writeFileSync(OUTPUT_PATH, `${JSON.stringify(database, null, 2)}\n`, "utf-8");

    console.log(`✓ Saved CPU database to src/lib/data/cpu-database.json`);
    console.log(`  Source: spec.org`);
    console.log(`  Date: ${database.dataAsOf}`);
    console.log(`  Total CPUs: ${database.cpus.length}`);
    if (database.cpus.length > 0) {
      console.log(`  Top: ${database.cpus[0].name} = ${database.cpus[0].specint2017Peak} peak`);
    }
  } catch (error) {
    console.warn(
      "⚠ Failed to fetch from SPEC.org:",
      error instanceof Error ? error.message : String(error)
    );

    // Fallback: keep existing file if it exists
    if (existsSync(OUTPUT_PATH)) {
      const existing = JSON.parse(readFileSync(OUTPUT_PATH, "utf-8"));
      const cpuCount = existing?.cpus?.length ?? "?";
      console.log(`→ Keeping existing cpu-database.json (${cpuCount} CPUs)`);
    } else {
      console.error("✗ No existing cpu-database.json found — build may fail");
      process.exit(1);
    }
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
