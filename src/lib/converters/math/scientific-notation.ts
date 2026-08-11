import type { CalculationResult } from "@/types";

export interface ScientificNotationInput {
  mode: "toScientific" | "fromScientific" | "operation";
  number?: number;
  mantissa?: number;
  exponent?: number;
  mantissa2?: number;
  exponent2?: number;
  operation?: "add" | "subtract" | "multiply" | "divide";
}

export interface ScientificNotationResult {
  standardForm: number;
  scientificNotation: string;
  mantissa: number;
  exponent: number;
  engineeringNotation: string;
  significantFigures: number;
  steps: string[];
  operationResult?: {
    standardForm: number;
    scientificNotation: string;
    mantissa: number;
    exponent: number;
  };
}

function toScientific(num: number): { mantissa: number; exponent: number } {
  if (num === 0) return { mantissa: 0, exponent: 0 };

  const exponent = Math.floor(Math.log10(Math.abs(num)));
  const mantissa = num / 10 ** exponent;

  return { mantissa, exponent };
}

function toEngineering(num: number): { mantissa: number; exponent: number } {
  if (num === 0) return { mantissa: 0, exponent: 0 };

  let exponent = Math.floor(Math.log10(Math.abs(num)));
  // Round exponent down to nearest multiple of 3
  exponent = Math.floor(exponent / 3) * 3;
  const mantissa = num / 10 ** exponent;

  return { mantissa, exponent };
}

function countSignificantFigures(num: number): number {
  if (num === 0) return 1;
  const str = Math.abs(num)
    .toString()
    .replace(/^0+|\.|-/g, "");
  return str.replace(/0+$/, "").length || 1;
}

function formatEngineering(num: number): string {
  const eng = toEngineering(num);
  return `${eng.mantissa.toFixed(6)} × 10^${eng.exponent}`;
}

export function calculateScientificNotation(
  input: ScientificNotationInput
): CalculationResult<ScientificNotationResult> {
  const { mode } = input;
  const steps: string[] = [];

  let standardForm: number;
  let mantissa: number;
  let exponent: number;

  switch (mode) {
    case "toScientific": {
      const { number: inputNumber } = input;
      if (inputNumber === undefined) {
        return {
          ok: false,
          error: "Number is required for toScientific mode",
          code: "INVALID_INPUT",
        };
      }

      standardForm = inputNumber;
      const result = toScientific(inputNumber);
      mantissa = result.mantissa;
      exponent = result.exponent;

      steps.push(`Original number: ${inputNumber}`);
      if (inputNumber !== 0) {
        steps.push(
          `Move decimal point ${Math.abs(exponent)} places ${exponent >= 0 ? "left" : "right"}`
        );
        steps.push(`Mantissa: ${mantissa.toFixed(6)}`);
        steps.push(`Exponent: ${exponent}`);
      }
      break;
    }

    case "fromScientific": {
      const { mantissa: inputMantissa, exponent: inputExponent } = input;
      if (inputMantissa === undefined || inputExponent === undefined) {
        return {
          ok: false,
          error: "Mantissa and exponent are required for fromScientific mode",
          code: "INVALID_INPUT",
        };
      }

      mantissa = inputMantissa;
      exponent = inputExponent;
      standardForm = mantissa * 10 ** exponent;

      steps.push(`${mantissa} × 10^${exponent}`);
      steps.push(`= ${mantissa} × ${10 ** exponent}`);
      steps.push(`= ${standardForm}`);
      break;
    }

    case "operation": {
      const { mantissa: m1, exponent: e1, mantissa2: m2, exponent2: e2, operation } = input;
      if (
        m1 === undefined ||
        e1 === undefined ||
        m2 === undefined ||
        e2 === undefined ||
        !operation
      ) {
        return {
          ok: false,
          error: "Two numbers and an operation are required for operation mode",
          code: "INVALID_INPUT",
        };
      }

      const num1 = m1 * 10 ** e1;
      const num2 = m2 * 10 ** e2;

      standardForm = num1;
      mantissa = m1;
      exponent = e1;

      let resultNum: number;
      switch (operation) {
        case "add":
          resultNum = num1 + num2;
          steps.push(`(${m1} × 10^${e1}) + (${m2} × 10^${e2})`);
          steps.push(`= ${num1} + ${num2}`);
          steps.push(`= ${resultNum}`);
          break;
        case "subtract":
          resultNum = num1 - num2;
          steps.push(`(${m1} × 10^${e1}) - (${m2} × 10^${e2})`);
          steps.push(`= ${num1} - ${num2}`);
          steps.push(`= ${resultNum}`);
          break;
        case "multiply":
          resultNum = num1 * num2;
          steps.push(`(${m1} × 10^${e1}) × (${m2} × 10^${e2})`);
          steps.push(`= (${m1} × ${m2}) × 10^(${e1} + ${e2})`);
          steps.push(`= ${m1 * m2} × 10^${e1 + e2}`);
          steps.push(`= ${resultNum}`);
          break;
        case "divide":
          if (num2 === 0) {
            return { ok: false, error: "Cannot divide by zero", code: "DIVISION_BY_ZERO" };
          }
          resultNum = num1 / num2;
          steps.push(`(${m1} × 10^${e1}) ÷ (${m2} × 10^${e2})`);
          steps.push(`= (${m1} / ${m2}) × 10^(${e1} - ${e2})`);
          steps.push(`= ${m1 / m2} × 10^${e1 - e2}`);
          steps.push(`= ${resultNum}`);
          break;
        default:
          return { ok: false, error: "Unknown operation specified", code: "INVALID_INPUT" };
      }

      const resultScientific = toScientific(resultNum);

      return {
        ok: true,
        value: {
          standardForm,
          scientificNotation: `${mantissa.toFixed(6)} × 10^${exponent}`,
          mantissa,
          exponent,
          engineeringNotation: formatEngineering(standardForm),
          significantFigures: countSignificantFigures(standardForm),
          steps,
          operationResult: {
            standardForm: resultNum,
            scientificNotation: `${resultScientific.mantissa.toFixed(6)} × 10^${resultScientific.exponent}`,
            mantissa: resultScientific.mantissa,
            exponent: resultScientific.exponent,
          },
        },
      };
    }

    default:
      return { ok: false, error: "Unknown mode specified", code: "INVALID_INPUT" };
  }

  const eng = toEngineering(standardForm);
  const engineeringNotation = `${eng.mantissa.toFixed(6)} × 10^${eng.exponent}`;
  const significantFigures = countSignificantFigures(standardForm);

  return {
    ok: true,
    value: {
      standardForm,
      scientificNotation: `${mantissa.toFixed(6)} × 10^${exponent}`,
      mantissa,
      exponent,
      engineeringNotation,
      significantFigures,
      steps,
    },
  };
}
