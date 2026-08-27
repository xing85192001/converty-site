import type { CalculationResult } from "@/types";

export interface LogarithmInput {
  value: number;
  base: number;
}

export interface LogarithmResult {
  result: number;
  naturalLog: number;
  log10: number;
  log2: number;
  antilog: number;
  formula: string;
  changeOfBase: string;
  properties: string[];
}

export function calculateLogarithm(input: LogarithmInput): CalculationResult<LogarithmResult> {
  const { value, base } = input;

  // Validate inputs
  if (value <= 0 || base <= 0 || base === 1) {
    return {
      ok: false,
      error: "Value must be positive and base must be positive and not equal to 1",
      code: "INVALID_INPUT",
    };
  }

  // Calculate logarithm using change of base formula
  const result = Math.log(value) / Math.log(base);
  const naturalLog = Math.log(value);
  const log10 = Math.log10(value);
  const log2 = Math.log2(value);

  // Antilog (base^result)
  const antilog = base ** result;

  // Formula
  const formula = `log_${base}(${value}) = ${result.toFixed(6)}`;

  // Change of base formula
  const changeOfBase = `log_${base}(${value}) = ln(${value}) / ln(${base}) = ${naturalLog.toFixed(6)} / ${Math.log(base).toFixed(6)}`;

  // Logarithm properties
  const properties: string[] = [
    `log_${base}(1) = 0`,
    `log_${base}(${base}) = 1`,
    `log_${base}(x × y) = log_${base}(x) + log_${base}(y)`,
    `log_${base}(x / y) = log_${base}(x) - log_${base}(y)`,
    `log_${base}(x^n) = n × log_${base}(x)`,
  ];

  return {
    ok: true,
    value: {
      result,
      naturalLog,
      log10,
      log2,
      antilog,
      formula,
      changeOfBase,
      properties,
    },
  };
}
