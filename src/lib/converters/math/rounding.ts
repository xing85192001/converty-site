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
  steps: string[];
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

  const steps: string[] = [];
  let rounded: number;
  let method: string;

  steps.push(`Original number: ${number}`);

  switch (mode) {
    case "round": {
      const factor = 10 ** decimalPlaces;
      rounded = Math.round(number * factor) / factor;
      method = `Round to ${decimalPlaces} decimal places`;
      steps.push(`Multiply by 10^${decimalPlaces}: ${number * factor}`);
      steps.push(`Round: ${Math.round(number * factor)}`);
      steps.push(`Divide by 10^${decimalPlaces}: ${rounded}`);
      break;
    }

    case "ceil": {
      const factor = 10 ** decimalPlaces;
      rounded = Math.ceil(number * factor) / factor;
      method = `Ceiling to ${decimalPlaces} decimal places`;
      steps.push(`Multiply by 10^${decimalPlaces}: ${number * factor}`);
      steps.push(`Ceiling: ${Math.ceil(number * factor)}`);
      steps.push(`Divide by 10^${decimalPlaces}: ${rounded}`);
      break;
    }

    case "floor": {
      const factor = 10 ** decimalPlaces;
      rounded = Math.floor(number * factor) / factor;
      method = `Floor to ${decimalPlaces} decimal places`;
      steps.push(`Multiply by 10^${decimalPlaces}: ${number * factor}`);
      steps.push(`Floor: ${Math.floor(number * factor)}`);
      steps.push(`Divide by 10^${decimalPlaces}: ${rounded}`);
      break;
    }

    case "truncate": {
      const factor = 10 ** decimalPlaces;
      rounded = Math.trunc(number * factor) / factor;
      method = `Truncate to ${decimalPlaces} decimal places`;
      steps.push(`Truncate (remove decimal part): ${rounded}`);
      break;
    }

    case "toFixed": {
      rounded = parseFloat(number.toFixed(decimalPlaces));
      method = `Fixed to ${decimalPlaces} decimal places`;
      steps.push(`toFixed(${decimalPlaces}): ${rounded}`);
      break;
    }

    case "toSignificant": {
      rounded = roundToSignificantFigures(number, significantFigures);
      method = `Round to ${significantFigures} significant figures`;
      steps.push(`Significant figures: ${significantFigures}`);
      steps.push(`Result: ${rounded}`);
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
