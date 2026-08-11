/**
 * Molarity calculator
 * M = n/V = m/(Mw×V)
 *
 * Where:
 * - M = molarity (mol/L)
 * - n = moles (mol)
 * - V = volume (L)
 * - m = mass (g)
 * - Mw = molecular weight (g/mol)
 */

import type { CalculationResult } from "@/types";

/**
 * Input for molarity calculation
 */
export interface MolarityInput {
  /** Calculation mode */
  mode: "mass-volume" | "moles-volume";
  /** Mass in grams (mass-volume mode) */
  mass?: number;
  /** Moles (moles-volume mode) */
  moles?: number;
  /** Molecular weight in g/mol (mass-volume mode) */
  molecularWeight?: number;
  /** Volume in liters */
  volume: number;
  /** Volume unit */
  volumeUnit: "L" | "mL" | "µL";
}

/**
 * Result of molarity calculation
 */
export interface MolarityResult {
  /** Molarity in mol/L */
  molarity: number;
  /** Formatted molarity string */
  formatted: string;
  /** Moles in solution */
  moles: number;
  /** Volume in liters */
  volumeL: number;
  /** Multi-unit molarity outputs */
  concentrationUnits: {
    M: number; // mol/L
    mM: number; // mmol/L
    µM: number; // µmol/L
    nM: number; // nmol/L
  };
  /** Calculation steps */
  steps: string[];
}

/**
 * Calculate molarity from mass or moles and volume
 *
 * @param input - Molarity input
 * @returns Molarity result or null if inputs are invalid
 */
export function calculateMolarity(input: MolarityInput): CalculationResult<MolarityResult> {
  const { mode, mass, moles, molecularWeight, volume, volumeUnit } = input;

  if (volume <= 0) {
    return { ok: false, error: "Volume must be positive", code: "INVALID_INPUT" };
  }

  const steps: string[] = [];

  // Convert volume to liters
  let volumeL: number;
  switch (volumeUnit) {
    case "L":
      volumeL = volume;
      steps.push(`Volume: ${volume} L`);
      break;
    case "mL":
      volumeL = volume / 1000;
      steps.push(`Volume: ${volume} mL = ${volumeL.toFixed(6)} L`);
      break;
    case "µL":
      volumeL = volume / 1e6;
      steps.push(`Volume: ${volume} µL = ${volumeL.toFixed(9)} L`);
      break;
  }

  let molesValue: number;

  if (mode === "mass-volume") {
    if (!mass || mass <= 0 || !molecularWeight || molecularWeight <= 0) {
      return {
        ok: false,
        error: "Mass and molecular weight must be positive for mass-volume mode",
        code: "INVALID_INPUT",
      };
    }

    steps.push(`Mass: ${mass} g`);
    steps.push(`Molecular weight: ${molecularWeight} g/mol`);

    // Calculate moles from mass
    molesValue = mass / molecularWeight;
    steps.push(`Moles: n = m / Mw = ${mass} / ${molecularWeight} = ${molesValue.toFixed(6)} mol`);
  } else {
    // moles-volume mode
    if (!moles || moles <= 0) {
      return {
        ok: false,
        error: "Moles must be positive for moles-volume mode",
        code: "INVALID_INPUT",
      };
    }

    molesValue = moles;
    steps.push(`Moles: ${moles} mol`);
  }

  // Calculate molarity
  const molarity = molesValue / volumeL;
  steps.push(
    `Molarity: M = n / V = ${molesValue.toFixed(6)} / ${volumeL.toFixed(6)} = ${molarity.toFixed(6)} mol/L`
  );

  // Multi-unit concentrations
  const concentrationUnits = {
    M: molarity,
    mM: molarity * 1000,
    µM: molarity * 1e6,
    nM: molarity * 1e9,
  };

  steps.push("");
  steps.push("Concentration in different units:");
  steps.push(`${concentrationUnits.M.toFixed(6)} M (mol/L)`);
  steps.push(`${concentrationUnits.mM.toFixed(3)} mM (mmol/L)`);
  steps.push(`${concentrationUnits.µM.toFixed(3)} µM (µmol/L)`);
  steps.push(`${concentrationUnits.nM.toFixed(3)} nM (nmol/L)`);

  return {
    ok: true,
    value: {
      molarity,
      formatted: molarity.toFixed(6),
      moles: molesValue,
      volumeL,
      concentrationUnits,
      steps,
    },
  };
}
