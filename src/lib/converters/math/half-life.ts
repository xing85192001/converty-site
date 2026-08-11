import type { CalculationResult } from "@/types";

export interface HalfLifeInput {
  mode: "decay" | "remaining" | "findHalfLife" | "findTime" | "carbon14";
  initialAmount?: number;
  remainingAmount?: number;
  halfLife?: number;
  time?: number;
  decayConstant?: number;
  // For carbon-14 dating
  percentRemaining?: number;
}

export interface HalfLifeResult {
  initialAmount: number;
  remainingAmount: number;
  halfLife: number;
  time: number;
  decayConstant: number;
  percentRemaining: number;
  numberOfHalfLives: number;
  formula: string;
  steps: string[];
  decayTable: Array<{ time: number; amount: number; halfLives: number }>;
}

const CARBON14_HALF_LIFE = 5730; // years

export function calculateHalfLife(input: HalfLifeInput): CalculationResult<HalfLifeResult> {
  const {
    mode,
    initialAmount: inputInitial,
    remainingAmount: inputRemaining,
    halfLife: inputHalfLife,
    time: inputTime,
    decayConstant: inputDecayConstant,
    percentRemaining,
  } = input;

  const steps: string[] = [];
  let initialAmount: number;
  let remainingAmount: number;
  let halfLife: number;
  let time: number;
  let decayConstant: number;
  let formula: string;

  switch (mode) {
    case "decay": {
      // Given: initial amount, half-life, and time
      // Find: remaining amount
      if (inputInitial === undefined || inputHalfLife === undefined || inputTime === undefined) {
        return {
          ok: false,
          error: "Initial amount, half-life, and time are required for decay mode",
          code: "INVALID_INPUT",
        };
      }
      if (inputInitial <= 0 || inputHalfLife <= 0 || inputTime < 0) {
        return {
          ok: false,
          error: "Initial amount and half-life must be positive, time must be non-negative",
          code: "INVALID_INPUT",
        };
      }

      initialAmount = inputInitial;
      halfLife = inputHalfLife;
      time = inputTime;
      decayConstant = Math.LN2 / halfLife;

      // N(t) = N₀ × (1/2)^(t/t½) = N₀ × e^(-λt)
      remainingAmount = initialAmount * 0.5 ** (time / halfLife);
      formula = "N(t) = N₀ × (1/2)^(t/t½)";

      steps.push(`Initial amount (N₀) = ${initialAmount}`);
      steps.push(`Half-life (t½) = ${halfLife}`);
      steps.push(`Time (t) = ${time}`);
      steps.push(`Decay constant (λ) = ln(2)/t½ = ${decayConstant.toFixed(6)}`);
      steps.push(`N(t) = ${initialAmount} × (1/2)^(${time}/${halfLife})`);
      steps.push(`N(t) = ${initialAmount} × (1/2)^${(time / halfLife).toFixed(4)}`);
      steps.push(`N(t) = ${remainingAmount.toFixed(6)}`);
      break;
    }

    case "remaining": {
      // Given: initial amount, remaining amount, half-life
      // Find: time elapsed
      if (
        inputInitial === undefined ||
        inputRemaining === undefined ||
        inputHalfLife === undefined
      ) {
        return {
          ok: false,
          error: "Initial amount, remaining amount, and half-life are required for remaining mode",
          code: "INVALID_INPUT",
        };
      }
      if (
        inputInitial <= 0 ||
        inputRemaining <= 0 ||
        inputRemaining > inputInitial ||
        inputHalfLife <= 0
      ) {
        return {
          ok: false,
          error:
            "Initial and remaining amounts must be positive, remaining must not exceed initial, half-life must be positive",
          code: "INVALID_INPUT",
        };
      }

      initialAmount = inputInitial;
      remainingAmount = inputRemaining;
      halfLife = inputHalfLife;
      decayConstant = Math.LN2 / halfLife;

      // t = t½ × log₂(N₀/N)
      time = halfLife * Math.log2(initialAmount / remainingAmount);
      formula = "t = t½ × log₂(N₀/N)";

      steps.push(`Initial amount (N₀) = ${initialAmount}`);
      steps.push(`Remaining amount (N) = ${remainingAmount}`);
      steps.push(`Half-life (t½) = ${halfLife}`);
      steps.push(`t = ${halfLife} × log₂(${initialAmount}/${remainingAmount})`);
      steps.push(`t = ${halfLife} × log₂(${(initialAmount / remainingAmount).toFixed(4)})`);
      steps.push(`t = ${halfLife} × ${Math.log2(initialAmount / remainingAmount).toFixed(4)}`);
      steps.push(`t = ${time.toFixed(4)}`);
      break;
    }

    case "findHalfLife": {
      // Given: initial amount, remaining amount, time
      // Find: half-life
      if (inputInitial === undefined || inputRemaining === undefined || inputTime === undefined) {
        return {
          ok: false,
          error: "Initial amount, remaining amount, and time are required for findHalfLife mode",
          code: "INVALID_INPUT",
        };
      }
      if (
        inputInitial <= 0 ||
        inputRemaining <= 0 ||
        inputRemaining > inputInitial ||
        inputTime <= 0
      ) {
        return {
          ok: false,
          error:
            "Initial and remaining amounts must be positive, remaining must not exceed initial, time must be positive",
          code: "INVALID_INPUT",
        };
      }

      initialAmount = inputInitial;
      remainingAmount = inputRemaining;
      time = inputTime;

      // t½ = t × ln(2) / ln(N₀/N)
      halfLife = (time * Math.LN2) / Math.log(initialAmount / remainingAmount);
      decayConstant = Math.LN2 / halfLife;
      formula = "t½ = t × ln(2) / ln(N₀/N)";

      steps.push(`Initial amount (N₀) = ${initialAmount}`);
      steps.push(`Remaining amount (N) = ${remainingAmount}`);
      steps.push(`Time (t) = ${time}`);
      steps.push(`t½ = ${time} × ln(2) / ln(${initialAmount}/${remainingAmount})`);
      steps.push(
        `t½ = ${time} × ${Math.LN2.toFixed(6)} / ${Math.log(initialAmount / remainingAmount).toFixed(6)}`
      );
      steps.push(`t½ = ${halfLife.toFixed(4)}`);
      break;
    }

    case "findTime": {
      // Given: decay constant or half-life, fraction remaining
      // Find: time
      if (inputDecayConstant !== undefined && inputDecayConstant > 0) {
        decayConstant = inputDecayConstant;
        halfLife = Math.LN2 / decayConstant;
      } else if (inputHalfLife !== undefined && inputHalfLife > 0) {
        halfLife = inputHalfLife;
        decayConstant = Math.LN2 / halfLife;
      } else {
        return {
          ok: false,
          error: "A valid decay constant or half-life is required for findTime mode",
          code: "INVALID_INPUT",
        };
      }

      const fraction =
        percentRemaining !== undefined
          ? percentRemaining / 100
          : inputRemaining && inputInitial
            ? inputRemaining / inputInitial
            : null;
      if (fraction === null || fraction <= 0 || fraction > 1) {
        return {
          ok: false,
          error: "A valid fraction remaining (0 < fraction ≤ 1) is required",
          code: "INVALID_INPUT",
        };
      }

      initialAmount = inputInitial || 100;
      remainingAmount = initialAmount * fraction;

      // t = -ln(N/N₀) / λ
      time = -Math.log(fraction) / decayConstant;
      formula = "t = -ln(N/N₀) / λ";

      steps.push(`Half-life (t½) = ${halfLife}`);
      steps.push(`Decay constant (λ) = ${decayConstant.toFixed(6)}`);
      steps.push(`Fraction remaining = ${(fraction * 100).toFixed(2)}%`);
      steps.push(`t = -ln(${fraction.toFixed(4)}) / ${decayConstant.toFixed(6)}`);
      steps.push(`t = ${time.toFixed(4)}`);
      break;
    }

    case "carbon14": {
      // Carbon-14 dating
      halfLife = CARBON14_HALF_LIFE;
      decayConstant = Math.LN2 / halfLife;

      const fraction =
        percentRemaining !== undefined
          ? percentRemaining / 100
          : inputRemaining && inputInitial
            ? inputRemaining / inputInitial
            : null;
      if (fraction === null || fraction <= 0 || fraction > 1) {
        return {
          ok: false,
          error: "A valid fraction remaining (0 < fraction ≤ 1) is required for carbon-14 dating",
          code: "INVALID_INPUT",
        };
      }

      initialAmount = inputInitial || 100;
      remainingAmount = initialAmount * fraction;

      // Age = -ln(N/N₀) / λ
      time = -Math.log(fraction) / decayConstant;
      formula = "Age = -t½ × ln(N/N₀) / ln(2)";

      steps.push(`Carbon-14 half-life = ${CARBON14_HALF_LIFE} years`);
      steps.push(
        `Decay constant (λ) = ln(2)/${CARBON14_HALF_LIFE} = ${decayConstant.toFixed(10)}/year`
      );
      steps.push(`Percentage of C-14 remaining = ${(fraction * 100).toFixed(2)}%`);
      steps.push(`Age = -ln(${fraction.toFixed(4)}) / ${decayConstant.toFixed(10)}`);
      steps.push(`Age = ${time.toFixed(0)} years`);

      if (time > 50000) {
        steps.push("Note: Carbon-14 dating is less reliable beyond ~50,000 years");
      }
      break;
    }

    default:
      return { ok: false, error: "Unknown mode specified", code: "INVALID_INPUT" };
  }

  const pctRemaining = (remainingAmount / initialAmount) * 100;
  const numberOfHalfLives = time / halfLife;

  // Generate decay table
  const decayTable: Array<{ time: number; amount: number; halfLives: number }> = [];
  for (let hl = 0; hl <= Math.max(5, Math.ceil(numberOfHalfLives)); hl++) {
    const t = hl * halfLife;
    const amt = initialAmount * 0.5 ** hl;
    decayTable.push({ time: t, amount: amt, halfLives: hl });
  }

  return {
    ok: true,
    value: {
      initialAmount,
      remainingAmount,
      halfLife,
      time,
      decayConstant,
      percentRemaining: pctRemaining,
      numberOfHalfLives,
      formula,
      steps,
      decayTable,
    },
  };
}
