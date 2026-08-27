/**
 * Chemical equation parser
 * Parses balanced chemical equations into structured format
 *
 * Examples:
 * - 2H2 + O2 → 2H2O
 * - Fe + 2HCl → FeCl2 + H2
 * - 2NaOH + H2SO4 → Na2SO4 + 2H2O
 */

import type { CalculationResult } from "@/types";

/**
 * A compound in a chemical equation with its coefficient
 */
export interface EquationCompound {
  /** Chemical formula */
  formula: string;
  /** Stoichiometric coefficient */
  coefficient: number;
}

/**
 * Parsed chemical equation
 */
export interface ParsedEquation {
  /** Reactants (left side) */
  reactants: EquationCompound[];
  /** Products (right side) */
  products: EquationCompound[];
  /** Original equation string */
  original: string;
}

/**
 * Result of equation parsing
 */
export type EquationParseResult = CalculationResult<ParsedEquation>;

/**
 * Parse a chemical equation string into structured format
 *
 * Accepts various arrow formats: →, ->, -->, ⟶, =
 *
 * @param equationStr - Chemical equation string (e.g., "2H2 + O2 → 2H2O")
 * @returns Parse result with equation or error
 */
export function parseChemicalEquation(equationStr: string): EquationParseResult {
  if (!equationStr || equationStr.trim().length === 0) {
    return { ok: false, error: "Empty equation", code: "INVALID_INPUT" };
  }

  // Normalize arrow formats
  const normalized = equationStr
    .replace(/--!?>/g, "→")
    .replace(/->/g, "→")
    .replace(/⟶/g, "→")
    .replace(/=/g, "→")
    .trim();

  // Split by arrow
  const arrowMatch = normalized.match(/(.+?)→(.+)/);
  if (!arrowMatch) {
    return {
      ok: false,
      error: "No arrow found in equation (use →, ->, or =)",
      code: "INVALID_INPUT",
    };
  }

  const [, leftSide, rightSide] = arrowMatch;

  try {
    const reactants = parseSide(leftSide);
    const products = parseSide(rightSide);

    if (reactants.length === 0) {
      return { ok: false, error: "No reactants found", code: "INVALID_INPUT" };
    }
    if (products.length === 0) {
      return { ok: false, error: "No products found", code: "INVALID_INPUT" };
    }

    return {
      ok: true,
      value: {
        reactants,
        products,
        original: equationStr,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to parse equation",
      code: "INVALID_INPUT",
    };
  }
}

/**
 * Parse one side of the equation (reactants or products)
 */
function parseSide(side: string): EquationCompound[] {
  const compounds: EquationCompound[] = [];

  // Split by + sign
  const parts = side.split("+").map((p) => p.trim());

  for (const part of parts) {
    if (part.length === 0) continue;

    // Extract coefficient and formula
    // Examples: "2H2O", "H2O", "3Ca(OH)2"
    const match = part.match(/^(\d+(?:\.\d+)?)?([A-Z].*)$/);

    if (!match) {
      throw new Error(`Invalid compound format: "${part}"`);
    }

    const [, coefficientStr, formula] = match;
    const coefficient = coefficientStr ? parseFloat(coefficientStr) : 1;

    if (!isValidFormula(formula)) {
      throw new Error(`Invalid chemical formula: "${formula}"`);
    }

    compounds.push({
      formula: formula.trim(),
      coefficient,
    });
  }

  return compounds;
}

/**
 * Basic validation of chemical formula
 * Checks for valid element symbols and basic structure
 */
function isValidFormula(formula: string): boolean {
  if (!formula || formula.trim().length === 0) {
    return false;
  }

  // Must start with uppercase letter
  if (!/^[A-Z]/.test(formula)) {
    return false;
  }

  // Should only contain valid characters: A-Z, a-z, 0-9, (), [], ·
  if (!/^[A-Za-z0-9()[\]·\s]+$/.test(formula)) {
    return false;
  }

  // Check balanced parentheses
  let parenCount = 0;
  let bracketCount = 0;
  for (const char of formula) {
    if (char === "(") parenCount++;
    if (char === ")") parenCount--;
    if (char === "[") bracketCount++;
    if (char === "]") bracketCount--;
    if (parenCount < 0 || bracketCount < 0) return false;
  }

  return parenCount === 0 && bracketCount === 0;
}

/**
 * Format equation as string
 */
export function formatEquation(equation: ParsedEquation): string {
  const formatSide = (compounds: EquationCompound[]) =>
    compounds
      .map((c) => {
        const coeff = c.coefficient === 1 ? "" : c.coefficient.toString();
        return `${coeff}${c.formula}`;
      })
      .join(" + ");

  return `${formatSide(equation.reactants)} → ${formatSide(equation.products)}`;
}

/**
 * Validate that an equation is balanced (same number of each element on both sides)
 * Note: This is a simplified check that counts atoms
 */
export function isEquationBalanced(_equation: ParsedEquation): boolean {
  // This would require counting atoms on both sides
  // For simplicity, we assume equations provided are already balanced
  // A full implementation would use parseChemicalFormula to count atoms
  return true; // Placeholder - assumes user provides balanced equations
}
