/**
 * Income Tax Calculator (Progressive)
 *
 * Computes progressive income tax from tax brackets. Ships with common
 * presets (US federal, UK, generic) and a custom bracket editor so it works
 * for any jurisdiction.
 *
 * Bracket format: each line "upperLimit, ratePercent" (top bracket uses 0
 * for an open-ended limit).
 */

import type { CalculationResult } from "@/types";

export type TaxPreset = "us" | "uk" | "generic" | "custom";

export interface TaxBracket {
  upTo: number; // upper bound (use 0 for open-ended top bracket)
  rate: number; // decimal, e.g. 0.22 for 22%
}

export const TAX_PRESETS: Record<Exclude<TaxPreset, "custom">, TaxBracket[]> = {
  us: [
    { upTo: 11000, rate: 0.1 },
    { upTo: 44725, rate: 0.12 },
    { upTo: 95375, rate: 0.22 },
    { upTo: 182100, rate: 0.24 },
    { upTo: 231250, rate: 0.32 },
    { upTo: 578125, rate: 0.35 },
    { upTo: 0, rate: 0.37 },
  ],
  uk: [
    { upTo: 12570, rate: 0 },
    { upTo: 50270, rate: 0.2 },
    { upTo: 125140, rate: 0.4 },
    { upTo: 0, rate: 0.45 },
  ],
  generic: [
    { upTo: 10000, rate: 0 },
    { upTo: 40000, rate: 0.15 },
    { upTo: 80000, rate: 0.25 },
    { upTo: 0, rate: 0.35 },
  ],
};

export const TAX_PRESET_OPTIONS: { value: TaxPreset; label: string }[] = [
  { value: "us", label: "US Federal (2023, single)" },
  { value: "uk", label: "UK (2023/24)" },
  { value: "generic", label: "Generic 3-tier" },
  { value: "custom", label: "Custom brackets" },
];

/** Parse "upper, rate%" bracket lines; 0 upper = open-ended. */
export function parseBrackets(raw: string): TaxBracket[] {
  const out: TaxBracket[] = [];
  for (const line of raw.split(/\n/)) {
    const parts = line.split(/[,;\t]/).map((p) => p.trim());
    if (parts.length < 2) continue;
    const upTo = Number(parts[0]);
    let rate = Number(parts[1].replace("%", ""));
    if (!Number.isFinite(upTo) || !Number.isFinite(rate)) continue;
    rate = rate > 1 ? rate / 100 : rate;
    out.push({ upTo, rate });
  }
  if (out.length === 0) out.push({ upTo: 0, rate: 0 });
  return out;
}

export interface IncomeTaxInput {
  system: TaxPreset;
  income: number;
  bracketsText?: string;
}

export interface IncomeTaxResult {
  tax: number;
  effectiveRate: number;
  marginalRate: number;
  net: number;
  breakdown: { bracket: string; tax: number }[];
}

/**
 * Calculate progressive tax for the given income and brackets.
 *
 * @returns tax owed, effective & marginal rates, net income, per-bracket breakdown
 */
export function calculateIncomeTax(input: IncomeTaxInput): CalculationResult<IncomeTaxResult> {
  const { system, income, bracketsText } = input;
  if (!Number.isFinite(income) || income < 0) {
    return { ok: false, error: "Enter a valid income", code: "INVALID_INPUT" };
  }

  const brackets = system === "custom" ? parseBrackets(bracketsText ?? "") : TAX_PRESETS[system];

  let lower = 0;
  let tax = 0;
  let marginalRate = 0;
  const breakdown: { bracket: string; tax: number }[] = [];

  for (const b of brackets) {
    const upper = b.upTo === 0 ? Infinity : b.upTo;
    if (income <= lower) break;
    const taxable = Math.min(income, upper) - lower;
    if (taxable > 0) {
      const due = taxable * b.rate;
      tax += due;
      marginalRate = b.rate;
      breakdown.push({
        bracket: `$${formatNum(lower)} – ${b.upTo === 0 ? "∞" : "$" + formatNum(upper)} @ ${Math.round(b.rate * 1000) / 10}%`,
        tax: due,
      });
    }
    lower = upper;
  }

  const effectiveRate = income > 0 ? tax / income : 0;
  return {
    ok: true,
    value: {
      tax,
      effectiveRate,
      marginalRate,
      net: income - tax,
      breakdown,
    },
  };
}

function formatNum(n: number): string {
  return n.toLocaleString("en-US");
}
