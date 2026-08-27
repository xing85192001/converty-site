import type { CalculationResult } from "@/types";
import type { ElementComposition } from "./types";

/**
 * Parse result payload
 */
export interface FormulaParsePayload {
  composition: ElementComposition;
}

/**
 * Parse result - either success with composition or error
 * @deprecated Use CalculationResult<FormulaParsePayload> instead
 */
export type ParseResult = CalculationResult<FormulaParsePayload>;

/**
 * Parse a chemical formula into element composition
 *
 * Supports:
 * - Simple formulas: H2O, NaCl, CH4
 * - Parentheses: Ca(OH)2, Mg(NO3)2
 * - Nested: Fe2(SO4)3, Al2(SO4)3
 * - Hydrates (dot notation): CuSO4·5H2O, Na2SO4·10H2O
 * - Complex ions with brackets: [Cu(NH3)4]SO4, K4[Fe(CN)6]
 *
 * @param formula - Chemical formula to parse
 * @returns Parse result with composition or error
 */
export function parseChemicalFormula(formula: string): ParseResult {
  if (!formula || formula.trim().length === 0) {
    return { ok: false, error: "Empty formula", code: "INVALID_INPUT" };
  }

  // Remove spaces
  const cleanFormula = formula.replace(/\s+/g, "");

  // Handle hydrates (dot notation) by parsing each part and multiplying
  if (cleanFormula.includes("·") || cleanFormula.includes(".")) {
    const parts = cleanFormula.split(/[·.]/);
    const composition: ElementComposition = {};

    for (const part of parts) {
      // Check if part starts with a number (hydrate multiplier)
      let multiplier = 1;
      let formulaPart = part;

      const match = part.match(/^(\d+)(.+)$/);
      if (match) {
        multiplier = parseInt(match[1], 10);
        formulaPart = match[2];
      }

      const result = parseFormulaRecursive(formulaPart, 0);
      if (!result.success) {
        return { ok: false, error: result.error, code: "INVALID_INPUT" };
      }

      // Merge with overall composition
      for (const [element, count] of Object.entries(result.composition)) {
        composition[element] = (composition[element] || 0) + count * multiplier;
      }
    }

    return { ok: true, value: { composition } };
  }

  // Parse single formula (no hydrate)
  const result = parseFormulaRecursive(cleanFormula, 0);
  if (!result.success) {
    return { ok: false, error: result.error, code: "INVALID_INPUT" };
  }
  return { ok: true, value: { composition: result.composition } };
}

/**
 * Recursive parser for a single formula part (without dot notation)
 */
function parseFormulaRecursive(
  formula: string,
  startPos: number
):
  | { success: true; composition: ElementComposition; endPos: number }
  | { success: false; error: string } {
  const composition: ElementComposition = {};
  let pos = startPos;

  while (pos < formula.length) {
    const char = formula[pos];

    // Handle opening brackets/parentheses
    if (char === "(" || char === "[") {
      const closingChar = char === "(" ? ")" : "]";
      const closingPos = findMatchingBracket(formula, pos, char, closingChar);

      if (closingPos === -1) {
        return { success: false, error: `Unmatched ${char} at position ${pos}` };
      }

      // Parse the group content
      const groupResult = parseFormulaRecursive(formula, pos + 1);
      if (!groupResult.success) {
        return groupResult;
      }

      // Check if there's a closing bracket at the expected position
      if (formula[groupResult.endPos] !== closingChar) {
        return {
          success: false,
          error: `Expected ${closingChar} at position ${groupResult.endPos}`,
        };
      }

      pos = groupResult.endPos + 1;

      // Get multiplier after closing bracket
      const multiplier = parseNumber(formula, pos);
      pos = multiplier.endPos;

      // Add elements from group to composition
      for (const [element, count] of Object.entries(groupResult.composition)) {
        composition[element] = (composition[element] || 0) + count * multiplier.value;
      }

      continue;
    }

    // Handle closing brackets/parentheses - end of current group
    if (char === ")" || char === "]") {
      return { success: true, composition, endPos: pos };
    }

    // Handle element symbol
    if (isUpperCase(char)) {
      const elementResult = parseElement(formula, pos);
      if (!elementResult.success) {
        return elementResult;
      }

      const { symbol, count, endPos } = elementResult;
      composition[symbol] = (composition[symbol] || 0) + count;
      pos = endPos;
      continue;
    }

    // Invalid character
    return { success: false, error: `Invalid character '${char}' at position ${pos}` };
  }

  return { success: true, composition, endPos: pos };
}

/**
 * Parse an element symbol and its count
 * Example: "Ca" → { symbol: "Ca", count: 1 }
 * Example: "O2" → { symbol: "O", count: 2 }
 */
function parseElement(
  formula: string,
  startPos: number
):
  | { success: true; symbol: string; count: number; endPos: number }
  | { success: false; error: string } {
  let pos = startPos;

  // First character must be uppercase
  if (!isUpperCase(formula[pos])) {
    return { success: false, error: `Expected uppercase letter at position ${pos}` };
  }

  let symbol = formula[pos];
  pos++;

  // Check for lowercase letter(s) in symbol
  while (pos < formula.length && isLowerCase(formula[pos])) {
    symbol += formula[pos];
    pos++;
  }

  // Parse optional count
  const countResult = parseNumber(formula, pos);
  const count = countResult.value;
  pos = countResult.endPos;

  return { success: true, symbol, count, endPos: pos };
}

/**
 * Parse a number at the given position
 * Returns { value: number, endPos: number }
 * If no number found, returns { value: 1, endPos: startPos }
 */
function parseNumber(formula: string, startPos: number): { value: number; endPos: number } {
  let pos = startPos;
  let numStr = "";

  while (pos < formula.length && isDigit(formula[pos])) {
    numStr += formula[pos];
    pos++;
  }

  if (numStr.length === 0) {
    return { value: 1, endPos: startPos };
  }

  return { value: parseInt(numStr, 10), endPos: pos };
}

/**
 * Find matching closing bracket/parenthesis
 * Returns -1 if not found
 */
function findMatchingBracket(
  formula: string,
  startPos: number,
  openChar: string,
  closeChar: string
): number {
  let depth = 1;
  let pos = startPos + 1;

  while (pos < formula.length && depth > 0) {
    if (formula[pos] === openChar) {
      depth++;
    } else if (formula[pos] === closeChar) {
      depth--;
    }
    if (depth > 0) {
      pos++;
    }
  }

  return depth === 0 ? pos : -1;
}

function isUpperCase(char: string): boolean {
  return char >= "A" && char <= "Z";
}

function isLowerCase(char: string): boolean {
  return char >= "a" && char <= "z";
}

function isDigit(char: string): boolean {
  return char >= "0" && char <= "9";
}
