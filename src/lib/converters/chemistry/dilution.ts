/**
 * Dilution calculator
 * M₁V₁ = M₂V₂
 *
 * Where:
 * - M₁ = initial molarity (mol/L)
 * - V₁ = initial volume (L)
 * - M₂ = final molarity (mol/L)
 * - V₂ = final volume (L)
 */

import type { CalculationResult } from "@/types";

/**
 * Input for dilution calculation
 */
export interface DilutionInput {
  /** Calculation mode */
  mode: "find-V1" | "find-V2" | "find-M2";
  /** Initial molarity (M₁) in mol/L */
  initialMolarity: number;
  /** Final molarity (M₂) in mol/L */
  finalMolarity?: number;
  /** Initial volume (V₁) */
  initialVolume?: number;
  /** Initial volume unit */
  initialVolumeUnit?: "L" | "mL" | "µL";
  /** Final volume (V₂) */
  finalVolume?: number;
  /** Final volume unit */
  finalVolumeUnit?: "L" | "mL" | "µL";
}

/**
 * Result of dilution calculation
 */
export interface DilutionResult {
  /** Initial molarity in mol/L */
  initialMolarity: number;
  /** Final molarity in mol/L */
  finalMolarity: number;
  /** Initial volume in liters */
  initialVolumeL: number;
  /** Final volume in liters */
  finalVolumeL: number;
  /** Dilution factor */
  dilutionFactor: number;
  /** Volume of solvent to add (L) */
  solventVolumeL: number;
  /** Formatted solvent volume in original units */
  formattedSolvent: string;
  /** Safety warning if dilution is extreme */
  safetyWarning?: string;
  /** Calculation steps */
  steps: string[];
}

/**
 * Calculate dilution parameters using M₁V₁ = M₂V₂
 *
 * @param input - Dilution input
 * @returns Dilution result or null if inputs are invalid
 */
export function calculateDilution(input: DilutionInput): CalculationResult<DilutionResult> {
  const {
    mode,
    initialMolarity,
    finalMolarity,
    initialVolume,
    initialVolumeUnit,
    finalVolume,
    finalVolumeUnit,
  } = input;

  if (initialMolarity <= 0) {
    return { ok: false, error: "Initial molarity must be positive", code: "INVALID_INPUT" };
  }

  const steps: string[] = [];
  steps.push(`Initial molarity (M₁): ${initialMolarity} M`);

  // Convert volumes to liters
  const convertToLiters = (value: number, unit: "L" | "mL" | "µL"): number => {
    switch (unit) {
      case "L":
        return value;
      case "mL":
        return value / 1000;
      case "µL":
        return value / 1e6;
    }
  };

  const formatVolume = (valueL: number, unit: "L" | "mL" | "µL"): string => {
    switch (unit) {
      case "L":
        return `${valueL.toFixed(6)} L`;
      case "mL":
        return `${(valueL * 1000).toFixed(3)} mL`;
      case "µL":
        return `${(valueL * 1e6).toFixed(3)} µL`;
    }
  };

  let initialVolumeL: number;
  let finalVolumeL: number;
  let finalMolarityValue: number;

  if (mode === "find-V1") {
    // Find initial volume needed
    if (
      !finalMolarity ||
      finalMolarity <= 0 ||
      !finalVolume ||
      finalVolume <= 0 ||
      !finalVolumeUnit
    ) {
      return {
        ok: false,
        error: "Final molarity and volume are required for find-V1 mode",
        code: "INVALID_INPUT",
      };
    }

    finalMolarityValue = finalMolarity;
    finalVolumeL = convertToLiters(finalVolume, finalVolumeUnit);
    steps.push(`Final molarity (M₂): ${finalMolarity} M`);
    steps.push(`Final volume (V₂): ${formatVolume(finalVolumeL, finalVolumeUnit)}`);

    // M₁V₁ = M₂V₂ → V₁ = M₂V₂ / M₁
    initialVolumeL = (finalMolarityValue * finalVolumeL) / initialMolarity;
    steps.push(
      `Initial volume (V₁): V₁ = M₂V₂ / M₁ = ${finalMolarityValue} × ${finalVolumeL.toFixed(6)} / ${initialMolarity} = ${initialVolumeL.toFixed(6)} L`
    );
  } else if (mode === "find-V2") {
    // Find final volume
    if (
      !initialVolume ||
      initialVolume <= 0 ||
      !initialVolumeUnit ||
      !finalMolarity ||
      finalMolarity <= 0
    ) {
      return {
        ok: false,
        error: "Initial volume and final molarity are required for find-V2 mode",
        code: "INVALID_INPUT",
      };
    }

    initialVolumeL = convertToLiters(initialVolume, initialVolumeUnit);
    finalMolarityValue = finalMolarity;
    steps.push(`Initial volume (V₁): ${formatVolume(initialVolumeL, initialVolumeUnit)}`);
    steps.push(`Final molarity (M₂): ${finalMolarity} M`);

    // M₁V₁ = M₂V₂ → V₂ = M₁V₁ / M₂
    finalVolumeL = (initialMolarity * initialVolumeL) / finalMolarityValue;
    steps.push(
      `Final volume (V₂): V₂ = M₁V₁ / M₂ = ${initialMolarity} × ${initialVolumeL.toFixed(6)} / ${finalMolarityValue} = ${finalVolumeL.toFixed(6)} L`
    );
  } else {
    // mode === "find-M2" - Find final molarity
    if (
      !initialVolume ||
      initialVolume <= 0 ||
      !initialVolumeUnit ||
      !finalVolume ||
      finalVolume <= 0 ||
      !finalVolumeUnit
    ) {
      return {
        ok: false,
        error: "Initial and final volumes are required for find-M2 mode",
        code: "INVALID_INPUT",
      };
    }

    initialVolumeL = convertToLiters(initialVolume, initialVolumeUnit);
    finalVolumeL = convertToLiters(finalVolume, finalVolumeUnit);
    steps.push(`Initial volume (V₁): ${formatVolume(initialVolumeL, initialVolumeUnit)}`);
    steps.push(`Final volume (V₂): ${formatVolume(finalVolumeL, finalVolumeUnit)}`);

    // M₁V₁ = M₂V₂ → M₂ = M₁V₁ / V₂
    finalMolarityValue = (initialMolarity * initialVolumeL) / finalVolumeL;
    steps.push(
      `Final molarity (M₂): M₂ = M₁V₁ / V₂ = ${initialMolarity} × ${initialVolumeL.toFixed(6)} / ${finalVolumeL.toFixed(6)} = ${finalMolarityValue.toFixed(6)} M`
    );
  }

  // Dilution factor
  const dilutionFactor = initialMolarity / finalMolarityValue;
  steps.push(`Dilution factor: ${dilutionFactor.toFixed(2)}×`);

  // Volume of solvent to add
  const solventVolumeL = finalVolumeL - initialVolumeL;
  steps.push(`Solvent to add: ${solventVolumeL.toFixed(6)} L`);

  // Safety warning for extreme dilutions or concentrated stock
  let safetyWarning: string | undefined;
  if (initialMolarity > 10 || dilutionFactor > 100) {
    safetyWarning =
      "⚠️ High concentration or large dilution factor. For concentrated acids/bases, always add acid to water, never water to acid.";
    steps.push("");
    steps.push(safetyWarning);
  }

  // Format solvent volume in appropriate unit
  const solventUnit = finalVolumeUnit || "mL";
  const formattedSolvent = formatVolume(solventVolumeL, solventUnit);

  return {
    ok: true,
    value: {
      initialMolarity,
      finalMolarity: finalMolarityValue,
      initialVolumeL,
      finalVolumeL,
      dilutionFactor,
      solventVolumeL,
      formattedSolvent,
      safetyWarning,
      steps,
    },
  };
}
