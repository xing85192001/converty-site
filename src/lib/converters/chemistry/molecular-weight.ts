import periodicTableData from "@/data/chemistry/periodic-table.json";
import type { CalculationResult } from "@/types";
import { parseChemicalFormula } from "./formula-parser";
import type { Element } from "./types";

/**
 * Input for molecular weight calculation
 */
export interface MolecularWeightInput {
  /** Chemical formula to analyze */
  formula: string;
}

/**
 * Element breakdown in compound
 */
export interface ElementBreakdown {
  symbol: string;
  name: string;
  atomicMass: number;
  count: number;
  totalMass: number;
  percentage: number;
}

/**
 * Result of molecular weight calculation
 */
export interface MolecularWeightResult {
  /** Original formula */
  formula: string;
  /** Molar mass in g/mol */
  molarMass: number;
  /** Formatted molar mass string */
  formatted: string;
  /** Element composition breakdown */
  elements: ElementBreakdown[];
  /** Total number of atoms */
  totalAtoms: number;
  /** Calculation steps */
  steps: string[];
}

/**
 * Calculate molecular weight and composition from chemical formula
 *
 * Examples:
 * - H2O → 18.015 g/mol
 * - Ca(OH)2 → 74.093 g/mol
 * - Fe2(SO4)3 → 399.878 g/mol
 * - CuSO4·5H2O → 249.685 g/mol
 *
 * @param input - Formula input
 * @returns Molecular weight result or null if formula is invalid
 */
export function calculateMolecularWeight(
  input: MolecularWeightInput
): CalculationResult<MolecularWeightResult> {
  const { formula } = input;

  if (!formula || formula.trim().length === 0) {
    return { ok: false, error: "Formula is required", code: "INVALID_INPUT" };
  }

  const steps: string[] = [];
  steps.push(`Formula: ${formula}`);

  // Parse formula
  const parseResult = parseChemicalFormula(formula);
  if (!parseResult.ok) {
    return { ok: false, error: parseResult.error, code: "INVALID_INPUT" };
  }

  const composition = parseResult.value.composition;
  steps.push(
    `Parsed composition: ${Object.entries(composition)
      .map(([symbol, count]) => `${symbol}: ${count}`)
      .join(", ")}`
  );

  // Get periodic table
  const periodicTable = periodicTableData as Element[];
  const elementMap = new Map<string, Element>();
  for (const element of periodicTable) {
    elementMap.set(element.symbol, element);
  }

  // Calculate molar mass
  let molarMass = 0;
  let totalAtoms = 0;
  const elements: ElementBreakdown[] = [];

  for (const [symbol, count] of Object.entries(composition)) {
    const element = elementMap.get(symbol);
    if (!element) {
      return { ok: false, error: `Unknown element: ${symbol}`, code: "INVALID_INPUT" };
    }

    const totalMass = element.atomicMass * count;
    molarMass += totalMass;
    totalAtoms += count;

    elements.push({
      symbol: element.symbol,
      name: element.name,
      atomicMass: element.atomicMass,
      count,
      totalMass,
      percentage: 0, // Will be calculated after total is known
    });

    steps.push(
      `${element.name} (${symbol}): ${count} × ${element.atomicMass.toFixed(4)} = ${totalMass.toFixed(4)} g/mol`
    );
  }

  // Calculate percentages
  for (const element of elements) {
    element.percentage = (element.totalMass / molarMass) * 100;
  }

  // Sort elements by decreasing mass
  elements.sort((a, b) => b.totalMass - a.totalMass);

  steps.push(`Total molar mass: ${molarMass.toFixed(3)} g/mol`);
  steps.push(`Total atoms: ${totalAtoms}`);

  // Add composition percentages
  steps.push("");
  steps.push("Composition by mass:");
  for (const element of elements) {
    steps.push(`${element.name}: ${element.percentage.toFixed(2)}%`);
  }

  return {
    ok: true,
    value: {
      formula,
      molarMass,
      formatted: molarMass.toFixed(3),
      elements,
      totalAtoms,
      steps,
    },
  };
}
