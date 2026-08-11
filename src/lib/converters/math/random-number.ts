import type { CalculationResult } from "@/types";

export interface RandomNumberInput {
  mode: "integer" | "float" | "multiple" | "dice" | "shuffle" | "sample";
  min?: number;
  max?: number;
  count?: number;
  diceSides?: number;
  diceCount?: number;
  items?: string[];
  sampleSize?: number;
  allowDuplicates?: boolean;
}

export interface RandomNumberResult {
  results: number[] | string[];
  sum?: number;
  average?: number;
  min?: number;
  max?: number;
  formula: string;
  distribution?: Record<number | string, number>;
}

function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function calculateRandomNumber(
  input: RandomNumberInput
): CalculationResult<RandomNumberResult> {
  const { mode } = input;

  switch (mode) {
    case "integer": {
      const { min = 1, max = 100, count = 1 } = input;
      if (min > max || count < 1 || count > 1000) {
        return {
          ok: false,
          error: "Min must be ≤ max and count must be between 1 and 1000",
          code: "INVALID_INPUT",
        };
      }

      const results: number[] = [];
      for (let i = 0; i < count; i++) {
        results.push(getRandomInt(min, max));
      }

      const sum = results.reduce((a, b) => a + b, 0);

      return {
        ok: true,
        value: {
          results,
          sum,
          average: sum / results.length,
          min: Math.min(...results),
          max: Math.max(...results),
          formula: `Random integer between ${min} and ${max}`,
        },
      };
    }

    case "float": {
      const { min = 0, max = 1, count = 1 } = input;
      if (min > max || count < 1 || count > 1000) {
        return {
          ok: false,
          error: "Min must be ≤ max and count must be between 1 and 1000",
          code: "INVALID_INPUT",
        };
      }

      const results: number[] = [];
      for (let i = 0; i < count; i++) {
        results.push(parseFloat(getRandomFloat(min, max).toFixed(6)));
      }

      const sum = results.reduce((a, b) => a + b, 0);

      return {
        ok: true,
        value: {
          results,
          sum,
          average: sum / results.length,
          min: Math.min(...results),
          max: Math.max(...results),
          formula: `Random float between ${min} and ${max}`,
        },
      };
    }

    case "multiple": {
      const { min = 1, max = 100, count = 10, allowDuplicates = true } = input;
      if (min > max || count < 1 || count > 1000) {
        return {
          ok: false,
          error: "Min must be ≤ max and count must be between 1 and 1000",
          code: "INVALID_INPUT",
        };
      }

      const range = max - min + 1;
      if (!allowDuplicates && count > range) {
        return {
          ok: false,
          error: "Cannot generate unique numbers: count exceeds available range",
          code: "INVALID_INPUT",
        };
      }

      const results: number[] = [];

      if (allowDuplicates) {
        for (let i = 0; i < count; i++) {
          results.push(getRandomInt(min, max));
        }
      } else {
        // Generate unique numbers
        const pool: number[] = [];
        for (let i = min; i <= max; i++) {
          pool.push(i);
        }
        const shuffled = shuffleArray(pool);
        results.push(...shuffled.slice(0, count));
      }

      const sum = results.reduce((a, b) => a + b, 0);

      // Calculate distribution
      const distribution: Record<number, number> = {};
      for (const num of results) {
        distribution[num] = (distribution[num] || 0) + 1;
      }

      return {
        ok: true,
        value: {
          results,
          sum,
          average: sum / results.length,
          min: Math.min(...results),
          max: Math.max(...results),
          formula: `${count} random integers between ${min} and ${max}${allowDuplicates ? "" : " (no duplicates)"}`,
          distribution,
        },
      };
    }

    case "dice": {
      const { diceSides = 6, diceCount = 1 } = input;
      if (diceSides < 2 || diceSides > 100 || diceCount < 1 || diceCount > 100) {
        return {
          ok: false,
          error: "Dice sides must be 2-100 and dice count must be 1-100",
          code: "INVALID_INPUT",
        };
      }

      const results: number[] = [];
      for (let i = 0; i < diceCount; i++) {
        results.push(getRandomInt(1, diceSides));
      }

      const sum = results.reduce((a, b) => a + b, 0);

      // Calculate distribution
      const distribution: Record<number, number> = {};
      for (const num of results) {
        distribution[num] = (distribution[num] || 0) + 1;
      }

      return {
        ok: true,
        value: {
          results,
          sum,
          average: sum / results.length,
          min: Math.min(...results),
          max: Math.max(...results),
          formula: `Rolling ${diceCount}d${diceSides}`,
          distribution,
        },
      };
    }

    case "shuffle": {
      const { items } = input;
      if (!items || items.length === 0 || items.length > 1000) {
        return {
          ok: false,
          error: "Items array must have between 1 and 1000 elements",
          code: "INVALID_INPUT",
        };
      }

      const results = shuffleArray(items);

      return {
        ok: true,
        value: {
          results,
          formula: `Shuffled ${items.length} items`,
        },
      };
    }

    case "sample": {
      const { items, sampleSize = 1, allowDuplicates = false } = input;
      if (!items || items.length === 0 || sampleSize < 1) {
        return {
          ok: false,
          error: "Items array must be non-empty and sample size must be at least 1",
          code: "INVALID_INPUT",
        };
      }
      if (!allowDuplicates && sampleSize > items.length) {
        return {
          ok: false,
          error: "Sample size cannot exceed items count when duplicates are not allowed",
          code: "INVALID_INPUT",
        };
      }

      const results: string[] = [];

      if (allowDuplicates) {
        for (let i = 0; i < sampleSize; i++) {
          const index = getRandomInt(0, items.length - 1);
          results.push(items[index]);
        }
      } else {
        const shuffled = shuffleArray(items);
        results.push(...shuffled.slice(0, sampleSize));
      }

      // Calculate distribution for strings
      const distribution: Record<string, number> = {};
      for (const item of results) {
        distribution[item] = (distribution[item] || 0) + 1;
      }

      return {
        ok: true,
        value: {
          results,
          formula: `Random sample of ${sampleSize} from ${items.length} items`,
          distribution,
        },
      };
    }

    default:
      return { ok: false, error: "Unknown mode specified", code: "INVALID_INPUT" };
  }
}
