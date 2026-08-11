/**
 * pH Calculator
 * Calculate pH, pOH, [H+], [OH-], and Henderson-Hasselbalch buffer calculations
 */

import acidsBasesData from "@/data/chemistry/acids-bases.json";
import type { CalculationResult } from "@/types";

/**
 * Input for pH calculation
 */
export interface PhInput {
  /** Calculation mode */
  mode:
    | "from-h-concentration"
    | "from-oh-concentration"
    | "from-ph"
    | "from-poh"
    | "strong-acid"
    | "strong-base"
    | "weak-acid"
    | "weak-base"
    | "buffer";
  /** Hydrogen ion concentration [H+] in mol/L */
  hConcentration?: number;
  /** Hydroxide ion concentration [OH-] in mol/L */
  ohConcentration?: number;
  /** pH value */
  ph?: number;
  /** pOH value */
  poh?: number;
  /** Concentration of acid/base in mol/L */
  concentration?: number;
  /** pKa of weak acid (for buffer calculations) */
  pka?: number;
  /** Concentration of conjugate base (for buffer) */
  baseConcentration?: number;
  /** Concentration of weak acid (for buffer) */
  acidConcentration?: number;
  /** Selected acid/base from database */
  compound?: string;
}

/**
 * Result of pH calculation
 */
export interface PhResult {
  /** pH value (0-14) */
  ph: number;
  /** pOH value (0-14) */
  poh: number;
  /** [H+] concentration in mol/L */
  hConcentration: number;
  /** [OH-] concentration in mol/L */
  ohConcentration: number;
  /** Solution type */
  solutionType: "strongly acidic" | "acidic" | "neutral" | "basic" | "strongly basic";
  /** Color on pH scale (for visualization) */
  color: string;
  /** pKa value (if applicable) */
  pka?: number;
  /** Compound name (if applicable) */
  compoundName?: string;
  /** Calculation steps */
  steps: string[];
}

const Kw = 1e-14; // Water ion product constant at 25°C

/**
 * Calculate pH and related values
 *
 * @param input - pH input
 * @returns pH result or null if invalid
 */
export function calculatePh(input: PhInput): CalculationResult<PhResult> {
  const { mode } = input;

  let ph: number;
  let poh: number;
  let hConcentration: number;
  let ohConcentration: number;
  let pka: number | undefined;
  let compoundName: string | undefined;
  const steps: string[] = [];

  try {
    switch (mode) {
      case "from-h-concentration":
        if (!input.hConcentration || input.hConcentration <= 0) {
          return { ok: false, error: "H+ concentration must be positive", code: "INVALID_INPUT" };
        }
        hConcentration = input.hConcentration;
        ph = -Math.log10(hConcentration);
        poh = 14 - ph;
        ohConcentration = 10 ** -poh;

        steps.push(`Given: [H⁺] = ${hConcentration.toExponential(3)} M`);
        steps.push(`pH = -log₁₀[H⁺] = -log₁₀(${hConcentration.toExponential(3)})`);
        steps.push(`pH = ${ph.toFixed(2)}`);
        steps.push(`pOH = 14 - pH = ${poh.toFixed(2)}`);
        steps.push(`[OH⁻] = 10^(-pOH) = ${ohConcentration.toExponential(3)} M`);
        break;

      case "from-oh-concentration":
        if (!input.ohConcentration || input.ohConcentration <= 0) {
          return { ok: false, error: "OH- concentration must be positive", code: "INVALID_INPUT" };
        }
        ohConcentration = input.ohConcentration;
        poh = -Math.log10(ohConcentration);
        ph = 14 - poh;
        hConcentration = 10 ** -ph;

        steps.push(`Given: [OH⁻] = ${ohConcentration.toExponential(3)} M`);
        steps.push(`pOH = -log₁₀[OH⁻] = -log₁₀(${ohConcentration.toExponential(3)})`);
        steps.push(`pOH = ${poh.toFixed(2)}`);
        steps.push(`pH = 14 - pOH = ${ph.toFixed(2)}`);
        steps.push(`[H⁺] = 10^(-pH) = ${hConcentration.toExponential(3)} M`);
        break;

      case "from-ph":
        if (input.ph === undefined || input.ph < 0 || input.ph > 14) {
          return { ok: false, error: "pH must be between 0 and 14", code: "INVALID_INPUT" };
        }
        ph = input.ph;
        poh = 14 - ph;
        hConcentration = 10 ** -ph;
        ohConcentration = 10 ** -poh;

        steps.push(`Given: pH = ${ph.toFixed(2)}`);
        steps.push(`[H⁺] = 10^(-pH) = ${hConcentration.toExponential(3)} M`);
        steps.push(`pOH = 14 - pH = ${poh.toFixed(2)}`);
        steps.push(`[OH⁻] = 10^(-pOH) = ${ohConcentration.toExponential(3)} M`);
        break;

      case "from-poh":
        if (input.poh === undefined || input.poh < 0 || input.poh > 14) {
          return { ok: false, error: "pOH must be between 0 and 14", code: "INVALID_INPUT" };
        }
        poh = input.poh;
        ph = 14 - poh;
        hConcentration = 10 ** -ph;
        ohConcentration = 10 ** -poh;

        steps.push(`Given: pOH = ${poh.toFixed(2)}`);
        steps.push(`pH = 14 - pOH = ${ph.toFixed(2)}`);
        steps.push(`[H⁺] = 10^(-pH) = ${hConcentration.toExponential(3)} M`);
        steps.push(`[OH⁻] = 10^(-pOH) = ${ohConcentration.toExponential(3)} M`);
        break;

      case "strong-acid":
        if (!input.concentration || input.concentration <= 0) {
          return { ok: false, error: "Concentration must be positive", code: "INVALID_INPUT" };
        }
        // For strong acids, [H+] = concentration
        hConcentration = input.concentration;
        ph = -Math.log10(hConcentration);
        poh = 14 - ph;
        ohConcentration = Kw / hConcentration;

        steps.push(`Strong acid: [H⁺] = concentration`);
        steps.push(`[H⁺] = ${hConcentration.toExponential(3)} M`);
        steps.push(`pH = -log₁₀[H⁺] = ${ph.toFixed(2)}`);
        steps.push(`pOH = 14 - pH = ${poh.toFixed(2)}`);
        steps.push(`[OH⁻] = Kw / [H⁺] = ${ohConcentration.toExponential(3)} M`);
        break;

      case "strong-base":
        if (!input.concentration || input.concentration <= 0) {
          return { ok: false, error: "Concentration must be positive", code: "INVALID_INPUT" };
        }
        // For strong bases, [OH-] = concentration
        ohConcentration = input.concentration;
        poh = -Math.log10(ohConcentration);
        ph = 14 - poh;
        hConcentration = Kw / ohConcentration;

        steps.push(`Strong base: [OH⁻] = concentration`);
        steps.push(`[OH⁻] = ${ohConcentration.toExponential(3)} M`);
        steps.push(`pOH = -log₁₀[OH⁻] = ${poh.toFixed(2)}`);
        steps.push(`pH = 14 - pOH = ${ph.toFixed(2)}`);
        steps.push(`[H⁺] = Kw / [OH⁻] = ${hConcentration.toExponential(3)} M`);
        break;

      case "weak-acid": {
        if (!input.concentration || input.concentration <= 0) {
          return { ok: false, error: "Concentration must be positive", code: "INVALID_INPUT" };
        }
        if (!input.pka && !input.compound) {
          return {
            ok: false,
            error: "pKa or compound selection is required for weak acid",
            code: "INVALID_INPUT",
          };
        }

        // Get pKa from compound or input
        if (input.compound) {
          const compound = acidsBasesData.find((c) => c.id === input.compound);
          if (!compound || compound.type !== "acid") {
            return { ok: false, error: "Invalid acid compound selected", code: "INVALID_INPUT" };
          }
          pka = compound.pka;
          compoundName = compound.name;
        } else {
          pka = input.pka!;
        }

        if (pka === undefined) {
          return { ok: false, error: "pKa value is required", code: "INVALID_INPUT" };
        }

        const ka = 10 ** -pka;
        // [H+] = sqrt(Ka × C)
        hConcentration = Math.sqrt(ka * input.concentration);
        ph = -Math.log10(hConcentration);
        poh = 14 - ph;
        ohConcentration = Kw / hConcentration;

        steps.push(`Weak acid: ${compoundName || "Unknown"}`);
        steps.push(`pKa = ${pka.toFixed(2)}`);
        steps.push(`Ka = 10^(-pKa) = ${ka.toExponential(3)}`);
        steps.push(`[H⁺] = √(Ka × C) = √(${ka.toExponential(3)} × ${input.concentration})`);
        steps.push(`[H⁺] = ${hConcentration.toExponential(3)} M`);
        steps.push(`pH = -log₁₀[H⁺] = ${ph.toFixed(2)}`);
        break;
      }

      case "weak-base":
        if (!input.concentration || input.concentration <= 0) {
          return { ok: false, error: "Concentration must be positive", code: "INVALID_INPUT" };
        }
        if (!input.pka && !input.compound) {
          return {
            ok: false,
            error: "pKa or compound selection is required for weak base",
            code: "INVALID_INPUT",
          };
        }

        // Get pKb from compound or calculate from pKa
        if (input.compound) {
          const compound = acidsBasesData.find((c) => c.id === input.compound);
          if (!compound || compound.type !== "base") {
            return { ok: false, error: "Invalid base compound selected", code: "INVALID_INPUT" };
          }
          const pkb = compound.pkb;
          if (pkb === undefined) {
            return {
              ok: false,
              error: "pKb value is missing for selected compound",
              code: "INVALID_INPUT",
            };
          }
          compoundName = compound.name;

          const kb = 10 ** -pkb;
          // [OH-] = sqrt(Kb × C)
          ohConcentration = Math.sqrt(kb * input.concentration);
          poh = -Math.log10(ohConcentration);
          ph = 14 - poh;
          hConcentration = Kw / ohConcentration;

          steps.push(`Weak base: ${compoundName}`);
          steps.push(`pKb = ${pkb.toFixed(2)}`);
          steps.push(`Kb = 10^(-pKb) = ${kb.toExponential(3)}`);
          steps.push(`[OH⁻] = √(Kb × C) = √(${kb.toExponential(3)} × ${input.concentration})`);
          steps.push(`[OH⁻] = ${ohConcentration.toExponential(3)} M`);
          steps.push(`pOH = -log₁₀[OH⁻] = ${poh.toFixed(2)}`);
          steps.push(`pH = 14 - pOH = ${ph.toFixed(2)}`);
        } else {
          return {
            ok: false,
            error: "Compound selection is required for weak-base mode",
            code: "INVALID_INPUT",
          };
        }
        break;

      case "buffer": {
        if (!input.acidConcentration || !input.baseConcentration) {
          return {
            ok: false,
            error: "Acid and base concentrations are required for buffer mode",
            code: "INVALID_INPUT",
          };
        }
        if (!input.pka && !input.compound) {
          return {
            ok: false,
            error: "pKa or compound selection is required for buffer",
            code: "INVALID_INPUT",
          };
        }

        // Henderson-Hasselbalch: pH = pKa + log([A-]/[HA])
        if (input.compound) {
          const compound = acidsBasesData.find((c) => c.id === input.compound);
          if (!compound || compound.type !== "acid") {
            return {
              ok: false,
              error: "Invalid acid compound selected for buffer",
              code: "INVALID_INPUT",
            };
          }
          pka = compound.pka;
          compoundName = compound.name;
        } else {
          pka = input.pka!;
        }

        if (pka === undefined) {
          return { ok: false, error: "pKa value is required for buffer", code: "INVALID_INPUT" };
        }

        const ratio = input.baseConcentration / input.acidConcentration;
        ph = pka + Math.log10(ratio);
        poh = 14 - ph;
        hConcentration = 10 ** -ph;
        ohConcentration = Kw / hConcentration;

        steps.push(`Buffer solution: ${compoundName || "Unknown"}`);
        steps.push(`Henderson-Hasselbalch equation: pH = pKa + log₁₀([A⁻]/[HA])`);
        steps.push(`pKa = ${pka.toFixed(2)}`);
        steps.push(`[A⁻] (base) = ${input.baseConcentration} M`);
        steps.push(`[HA] (acid) = ${input.acidConcentration} M`);
        steps.push(`Ratio = [A⁻]/[HA] = ${ratio.toFixed(4)}`);
        steps.push(`pH = ${pka.toFixed(2)} + log₁₀(${ratio.toFixed(4)}) = ${ph.toFixed(2)}`);
        break;
      }

      default:
        return { ok: false, error: "Invalid calculation mode", code: "INVALID_INPUT" };
    }

    // Determine solution type
    let solutionType: PhResult["solutionType"];
    let color: string;

    if (ph < 3) {
      solutionType = "strongly acidic";
      color = "#dc2626"; // red-600
    } else if (ph < 7) {
      solutionType = "acidic";
      color = "#f97316"; // orange-500
    } else if (ph === 7) {
      solutionType = "neutral";
      color = "#84cc16"; // lime-500
    } else if (ph < 11) {
      solutionType = "basic";
      color = "#3b82f6"; // blue-500
    } else {
      solutionType = "strongly basic";
      color = "#8b5cf6"; // violet-500
    }

    return {
      ok: true,
      value: {
        ph,
        poh,
        hConcentration,
        ohConcentration,
        solutionType,
        color,
        pka,
        compoundName,
        steps,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Calculation error",
      code: "CALCULATION_ERROR",
    };
  }
}
