/**
 * Stoichiometry calculator
 * Calculate limiting reactant, theoretical yield, and mole ratios
 */

import periodicTableData from "@/data/chemistry/periodic-table.json";
import type { CalcStep } from "@/lib/calc-step";
import type { CalculationResult } from "@/types";
import { parseChemicalEquation } from "./equation-parser";
import { parseChemicalFormula } from "./formula-parser";
import type { Element } from "./types";

/**
 * Input for stoichiometry calculation
 */
export interface StoichiometryInput {
  /** Balanced chemical equation */
  equation: string;
  /** Reactants with their masses in grams */
  reactantMasses: Record<string, number>;
}

/**
 * Information about a reactant
 */
export interface ReactantInfo {
  formula: string;
  coefficient: number;
  massGiven: number;
  molarMass: number;
  molesAvailable: number;
  molesRequired: number;
  isLimiting: boolean;
}

/**
 * Information about a product
 */
export interface ProductInfo {
  formula: string;
  coefficient: number;
  molarMass: number;
  molesProduced: number;
  massProduced: number;
}

/**
 * Result of stoichiometry calculation
 */
export interface StoichiometryResult {
  /** Parsed equation */
  equation: string;
  /** Reactant information */
  reactants: ReactantInfo[];
  /** Limiting reactant formula */
  limitingReactant: string;
  /** Product information */
  products: ProductInfo[];
  /** Calculation steps */
  steps: CalcStep[];
}

/**
 * Calculate stoichiometry for a chemical reaction
 *
 * @param input - Stoichiometry input
 * @returns Stoichiometry result or null if invalid
 */
export function calculateStoichiometry(
  input: StoichiometryInput
): CalculationResult<StoichiometryResult> {
  const { equation, reactantMasses } = input;

  if (!equation || Object.keys(reactantMasses).length === 0) {
    return { ok: false, error: "Equation and reactant masses are required", code: "INVALID_INPUT" };
  }

  const steps: CalcStep[] = [];
  steps.push({ key: "equation", params: { equation } });

  // Parse equation
  const parseResult = parseChemicalEquation(equation);
  if (!parseResult.ok) {
    return { ok: false, error: parseResult.error, code: "INVALID_INPUT" };
  }

  const parsedEq = parseResult.value;
  steps.push({ key: "separator" });
  steps.push({ key: "step1MolarMasses" });

  // Get periodic table
  const periodicTable = periodicTableData as Element[];
  const elementMap = new Map<string, Element>();
  for (const element of periodicTable) {
    elementMap.set(element.symbol, element);
  }

  // Calculate molar masses for all compounds
  const molarMasses = new Map<string, number>();

  for (const compound of [...parsedEq.reactants, ...parsedEq.products]) {
    if (!molarMasses.has(compound.formula)) {
      const molarMass = calculateMolarMass(compound.formula, elementMap);
      if (molarMass === null) {
        return {
          ok: false,
          error: `Invalid formula or unknown element in ${compound.formula}`,
          code: "INVALID_INPUT",
        };
      }
      molarMasses.set(compound.formula, molarMass);
      steps.push({
        key: "molarMass",
        params: { formula: compound.formula, value: molarMass.toFixed(3) },
      });
    }
  }

  steps.push({ key: "separator" });
  steps.push({ key: "step2Moles" });

  // Calculate moles for each reactant
  const reactantInfo: ReactantInfo[] = [];

  for (const reactant of parsedEq.reactants) {
    const massGiven = reactantMasses[reactant.formula] || 0;
    const molarMass = molarMasses.get(reactant.formula)!;
    const molesAvailable = massGiven / molarMass;

    steps.push({
      key: "molesCalc",
      params: {
        formula: reactant.formula,
        mass: massGiven,
        molarMass: molarMass.toFixed(3),
        result: molesAvailable.toFixed(6),
      },
    });

    reactantInfo.push({
      formula: reactant.formula,
      coefficient: reactant.coefficient,
      massGiven,
      molarMass,
      molesAvailable,
      molesRequired: 0, // Will be calculated
      isLimiting: false, // Will be determined
    });
  }

  steps.push({ key: "separator" });
  steps.push({ key: "step3Limiting" });

  // Find limiting reactant
  // For each reactant, calculate the mole ratio relative to its stoichiometric coefficient
  let minRatio = Infinity;
  let limitingIndex = 0;

  for (let i = 0; i < reactantInfo.length; i++) {
    const info = reactantInfo[i];
    // Ratio = moles available / coefficient
    const ratio = info.molesAvailable / info.coefficient;
    steps.push({
      key: "ratioCalc",
      params: {
        formula: info.formula,
        moles: info.molesAvailable.toFixed(6),
        coefficient: info.coefficient,
        result: ratio.toFixed(6),
      },
    });

    if (ratio < minRatio) {
      minRatio = ratio;
      limitingIndex = i;
    }
  }

  reactantInfo[limitingIndex].isLimiting = true;
  const limitingReactant = reactantInfo[limitingIndex].formula;

  steps.push({ key: "limitingReactant", params: { formula: limitingReactant } });

  // Calculate moles required based on limiting reactant
  const limitingMoles = reactantInfo[limitingIndex].molesAvailable;
  const limitingCoeff = reactantInfo[limitingIndex].coefficient;

  for (const info of reactantInfo) {
    info.molesRequired = (limitingMoles / limitingCoeff) * info.coefficient;
  }

  steps.push({ key: "separator" });
  steps.push({ key: "step4Yield" });

  // Calculate product yields based on limiting reactant
  const productInfo: ProductInfo[] = [];

  for (const product of parsedEq.products) {
    const molarMass = molarMasses.get(product.formula)!;
    const molesProduced = (limitingMoles / limitingCoeff) * product.coefficient;
    const massProduced = molesProduced * molarMass;

    steps.push({
      key: "yieldCalc",
      params: {
        formula: product.formula,
        moles: molesProduced.toFixed(6),
        molarMass: molarMass.toFixed(3),
        result: massProduced.toFixed(3),
      },
    });

    productInfo.push({
      formula: product.formula,
      coefficient: product.coefficient,
      molarMass,
      molesProduced,
      massProduced,
    });
  }

  return {
    ok: true,
    value: {
      equation,
      reactants: reactantInfo,
      limitingReactant,
      products: productInfo,
      steps,
    },
  };
}

/**
 * Calculate molar mass of a compound
 */
function calculateMolarMass(formula: string, elementMap: Map<string, Element>): number | null {
  const parseResult = parseChemicalFormula(formula);
  if (!parseResult.ok) {
    return null;
  }

  let molarMass = 0;
  for (const [symbol, count] of Object.entries(parseResult.value.composition)) {
    const element = elementMap.get(symbol);
    if (!element) {
      return null;
    }
    molarMass += element.atomicMass * count;
  }

  return molarMass;
}
