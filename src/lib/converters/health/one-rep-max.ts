import type { CalculationResult } from "@/types";

export interface OneRepMaxInput {
  weight: number; // kg or lbs
  reps: number;
}

export interface OneRepMaxResult {
  epley: number;
  brzycki: number;
  lander: number;
  lombardi: number;
  mayhew: number;
  oconner: number;
  wathan: number;
  average: number;
  percentages: Array<{
    percent: number;
    weight: number;
    reps: string;
  }>;
}

export function calculateOneRepMax(input: OneRepMaxInput): CalculationResult<OneRepMaxResult> {
  const { weight, reps } = input;

  if (weight <= 0 || reps <= 0 || reps > 30) {
    return {
      ok: false,
      error: "Weight must be positive and reps must be between 1 and 30",
      code: "INVALID_INPUT",
    };
  }

  // Various 1RM formulas
  // Epley Formula: weight × (1 + reps/30)
  const epley = weight * (1 + reps / 30);

  // Brzycki Formula: weight × (36 / (37 - reps))
  // Note: reps is validated to be <= 30, so division by zero is not possible
  const brzycki = weight * (36 / (37 - reps));

  // Lander Formula: (100 × weight) / (101.3 - 2.67123 × reps)
  const lander = (100 * weight) / (101.3 - 2.67123 * reps);

  // Lombardi Formula: weight × reps^0.10
  const lombardi = weight * reps ** 0.1;

  // Mayhew Formula: (100 × weight) / (52.2 + 41.9 × e^(-0.055 × reps))
  const mayhew = (100 * weight) / (52.2 + 41.9 * Math.exp(-0.055 * reps));

  // O'Conner Formula: weight × (1 + reps/40)
  const oconner = weight * (1 + reps / 40);

  // Wathan Formula: (100 × weight) / (48.8 + 53.8 × e^(-0.075 × reps))
  const wathan = (100 * weight) / (48.8 + 53.8 * Math.exp(-0.075 * reps));

  const average = (epley + brzycki + lander + lombardi + mayhew + oconner + wathan) / 7;

  // Calculate percentage-based weights
  const percentages = [
    { percent: 100, reps: "1" },
    { percent: 95, reps: "2" },
    { percent: 90, reps: "4" },
    { percent: 85, reps: "6" },
    { percent: 80, reps: "8" },
    { percent: 75, reps: "10" },
    { percent: 70, reps: "12" },
    { percent: 65, reps: "15" },
    { percent: 60, reps: "20" },
  ].map(({ percent, reps }) => ({
    percent,
    weight: average * (percent / 100),
    reps,
  }));

  return {
    ok: true,
    value: {
      epley,
      brzycki,
      lander,
      lombardi,
      mayhew,
      oconner,
      wathan,
      average,
      percentages,
    },
  };
}
