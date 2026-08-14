import type { CalcStep } from "@/lib/calc-step";
import type { CalculationResult } from "@/types";

export interface RoundingInput {
  mode: "round" | "ceil" | "floor" | "truncate" | "toFixed" | "toSignificant";
  number: number;
  decimalPlaces?: number;
  significantFigures?: number;
}

export interface RoundingResult {
  original: number;
  rounded: number;
  method: string;
  decimalPlaces: number;
  difference: number;
  percentChange: number;
  steps: CalcStep[];
}

function countDecimalPlaces(num: number): number {
  const str = num.toString();
  if (!str.includes(".")) return 0;
  return str.split(".")[1].length;
}

function roundToSignificantFigures(num: number, sigFigs: number): number {
  if (num === 0) return 0;
  const magnitude = Math.floor(Math.log10(Math.abs(num)));
  const scale = 10 ** (sigFigs - magnitude - 1);
  return Math.round(num * scale) / scale;
}

export function calculateRounding(input: RoundingInput): CalculationResult<RoundingResult> {
  const { mode, number, decimalPlaces = 0, significantFigures = 3 } = input;

  if (!Number.isFinite(number)) {
    return { ok: false, error: "Number must be a finite value", code: "INVALID_INPUT" };
  }

  const steps: CalcStep[] = [];
  let rounded: number;
  let method: string;

  steps.push({ key: "originalNumber", params: { number } });

  switch (mode) {
    case "round": {
      const factor = 10 ** decimalPlaces;
      rounded = Math.round(number * factor) / factor;
      method = `Round to ${decimalPlaces} decimal places`;
      steps.push({ key: "roundMultiply", params: { decimalPlaces, product: number * factor } });
      steps.push({ key: "roundRound", params: { value: Math.round(number * factor) } });
      steps.push({ key: "roundDivide", params: { decimalPlaces, result: rounded } });
      break;
    }

    case "ceil": {
      const factor = 10 ** decimalPlaces;
      rounded = Math.ceil(number * factor) / factor;
      method = `Ceiling to ${decimalPlaces} decimal places`;
      steps.push({ key: "ceilMultiply", params: { decimalPlaces, product: number * factor } });
      steps.push({ key: "ceilCeil", params: { value: Math.ceil(number * factor) } });
      steps.push({ key: "ceilDivide", params: { decimalPlaces, result: rounded } });
      break;
    }

    case "floor": {
      const factor = 10 ** decimalPlaces;
      rounded = Math.floor(number * factor) / factor;
      method = `Floor to ${decimalPlaces} decimal places`;
      steps.push({ key: "floorMultiply", params: { decimalPlaces, product: number * factor } });
      steps.push({ key: "floorFloor", params: { value: Math.floor(number * factor) } });
      steps.push({ key: "floorDivide", params: { decimalPlaces, result: rounded } });
      break;
    }

    case "truncate": {
      const factor = 10 ** decimalPlaces;
      rounded = Math.trunc(number * factor) / factor;
      method = `Truncate to ${decimalPlaces} decimal places`;
      steps.push({ key: "truncate", params: { result: rounded } });
      break;
    }

    case "toFixed": {
      rounded = parseFloat(number.toFixed(decimalPlaces));
      method = `Fixed to ${decimalPlaces} decimal places`;
      steps.push({ key: "toFixed", params: { decimalPlaces, result: rounded } });
      break;
    }

    case "toSignificant": {
      rounded = roundToSignificantFigures(number, significantFigures);
      method = `Round to ${significantFigures} significant figures`;
      steps.push({ key: "sigFigs", params: { significantFigures } });
      steps.push({ key: "sigFigsResult", params: { result: rounded } });
      break;
    }

    default:
      return { ok: false, error: "Unknown mode specified", code: "INVALID_INPUT" };
  }

  const difference = rounded - number;
  const percentChange = number !== 0 ? (difference / number) * 100 : 0;

  return {
    ok: true,
    value: {
      original: number,
      rounded,
      method,
      decimalPlaces: countDecimalPlaces(rounded),
      difference,
      percentChange,
      steps,
    },
  };
}
