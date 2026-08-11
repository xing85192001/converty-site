import type { CalculationResult } from "@/types";

export interface BasicCalculatorInput {
  expression: string;
  precision?: number;
  angleMode?: "degrees" | "radians";
}

export interface BasicCalculatorResult {
  result: number;
  expression: string;
  formattedResult: string;
  steps: string[];
  variables: Record<string, number>;
}

// Constants
const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
  phi: (1 + Math.sqrt(5)) / 2, // Golden ratio
  sqrt2: Math.SQRT2,
  sqrt3: Math.sqrt(3),
  ln2: Math.LN2,
  ln10: Math.LN10,
};

// Tokenize expression
function tokenize(expr: string): string[] {
  const tokens: string[] = [];
  let current = "";

  for (let i = 0; i < expr.length; i++) {
    const char = expr[i];

    if (/\s/.test(char)) {
      if (current) {
        tokens.push(current);
        current = "";
      }
      continue;
    }

    if (/[0-9.]/.test(char)) {
      current += char;
    } else if (/[a-zA-Z]/.test(char)) {
      current += char;
    } else if ("+-*/^%()".includes(char)) {
      if (current) {
        tokens.push(current);
        current = "";
      }
      tokens.push(char);
    }
  }

  if (current) {
    tokens.push(current);
  }

  return tokens;
}

// Convert to postfix (Shunting Yard algorithm)
function toPostfix(tokens: string[]): string[] {
  const output: string[] = [];
  const operators: string[] = [];

  const precedence: Record<string, number> = {
    "+": 1,
    "-": 1,
    "*": 2,
    "/": 2,
    "%": 2,
    "^": 3,
  };

  const rightAssociative = new Set(["^"]);

  const isOperator = (token: string) => token in precedence;
  const isFunction = (token: string) =>
    [
      "sin",
      "cos",
      "tan",
      "asin",
      "acos",
      "atan",
      "sqrt",
      "cbrt",
      "log",
      "ln",
      "log10",
      "log2",
      "abs",
      "floor",
      "ceil",
      "round",
      "exp",
      "fact",
    ].includes(token);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (/^-?\d+\.?\d*$/.test(token) || token in CONSTANTS) {
      output.push(token);
    } else if (isFunction(token)) {
      operators.push(token);
    } else if (isOperator(token)) {
      while (
        operators.length > 0 &&
        isOperator(operators[operators.length - 1]) &&
        (precedence[operators[operators.length - 1]] > precedence[token] ||
          (precedence[operators[operators.length - 1]] === precedence[token] &&
            !rightAssociative.has(token)))
      ) {
        output.push(operators.pop()!);
      }
      operators.push(token);
    } else if (token === "(") {
      operators.push(token);
    } else if (token === ")") {
      while (operators.length > 0 && operators[operators.length - 1] !== "(") {
        output.push(operators.pop()!);
      }
      if (operators.length > 0) operators.pop(); // Remove "("
      if (operators.length > 0 && isFunction(operators[operators.length - 1])) {
        output.push(operators.pop()!);
      }
    }
  }

  while (operators.length > 0) {
    output.push(operators.pop()!);
  }

  return output;
}

// Evaluate postfix expression
function evaluatePostfix(
  postfix: string[],
  angleMode: "degrees" | "radians",
  steps: string[]
): number {
  const stack: number[] = [];

  const toRadians = (deg: number) => deg * (Math.PI / 180);
  const toDegrees = (rad: number) => rad * (180 / Math.PI);

  const factorial = (n: number): number => {
    if (n < 0 || !Number.isInteger(n)) return NaN;
    if (n <= 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  };

  for (const token of postfix) {
    if (/^-?\d+\.?\d*$/.test(token)) {
      stack.push(parseFloat(token));
    } else if (token in CONSTANTS) {
      stack.push(CONSTANTS[token]);
      steps.push(`${token} = ${CONSTANTS[token]}`);
    } else if (["+", "-", "*", "/", "^", "%"].includes(token)) {
      const b = stack.pop()!;
      const a = stack.pop()!;
      let result: number;

      switch (token) {
        case "+":
          result = a + b;
          break;
        case "-":
          result = a - b;
          break;
        case "*":
          result = a * b;
          break;
        case "/":
          result = a / b;
          break;
        case "^":
          result = a ** b;
          break;
        case "%":
          result = a % b;
          break;
        default:
          result = NaN;
      }

      steps.push(`${a} ${token} ${b} = ${result}`);
      stack.push(result);
    } else {
      // Functions
      const a = stack.pop()!;
      let result: number;
      let angle = a;

      if (angleMode === "degrees" && ["sin", "cos", "tan"].includes(token)) {
        angle = toRadians(a);
      }

      switch (token) {
        case "sin":
          result = Math.sin(angle);
          break;
        case "cos":
          result = Math.cos(angle);
          break;
        case "tan":
          result = Math.tan(angle);
          break;
        case "asin":
          result = Math.asin(a);
          if (angleMode === "degrees") result = toDegrees(result);
          break;
        case "acos":
          result = Math.acos(a);
          if (angleMode === "degrees") result = toDegrees(result);
          break;
        case "atan":
          result = Math.atan(a);
          if (angleMode === "degrees") result = toDegrees(result);
          break;
        case "sqrt":
          result = Math.sqrt(a);
          break;
        case "cbrt":
          result = Math.cbrt(a);
          break;
        case "log":
          result = Math.log10(a);
          break;
        case "ln":
          result = Math.log(a);
          break;
        case "log10":
          result = Math.log10(a);
          break;
        case "log2":
          result = Math.log2(a);
          break;
        case "abs":
          result = Math.abs(a);
          break;
        case "floor":
          result = Math.floor(a);
          break;
        case "ceil":
          result = Math.ceil(a);
          break;
        case "round":
          result = Math.round(a);
          break;
        case "exp":
          result = Math.exp(a);
          break;
        case "fact":
          result = factorial(a);
          break;
        default:
          result = NaN;
      }

      steps.push(`${token}(${a}) = ${result}`);
      stack.push(result);
    }
  }

  return stack[0] || 0;
}

export function calculateBasicCalculator(
  input: BasicCalculatorInput
): CalculationResult<BasicCalculatorResult> {
  const { expression, precision = 10, angleMode = "radians" } = input;

  if (!expression || expression.trim().length === 0) {
    return { ok: false, error: "Expression is required", code: "INVALID_INPUT" };
  }

  const steps: string[] = [];

  try {
    // Clean and normalize expression
    let cleanExpr = expression
      .toLowerCase()
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/\s+/g, " ")
      .trim();

    steps.push(`Expression: ${expression}`);
    steps.push(`Angle mode: ${angleMode}`);

    // Handle implicit multiplication: 2pi -> 2*pi, 2(3) -> 2*(3)
    cleanExpr = cleanExpr
      .replace(/(\d)([a-z])/g, "$1*$2")
      .replace(/(\d)\(/g, "$1*(")
      .replace(/\)(\d)/g, ")*$1")
      .replace(/\)([a-z])/g, ")*$1");

    // Handle negative numbers at start or after operators
    const tokens = tokenize(cleanExpr);

    // Convert negative sign handling
    const processedTokens: string[] = [];
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i] === "-" && (i === 0 || "+-*/^(%".includes(tokens[i - 1]))) {
        // Negative sign
        if (i + 1 < tokens.length && /^[\d.]/.test(tokens[i + 1])) {
          processedTokens.push(`-${tokens[i + 1]}`);
          i++;
        } else {
          processedTokens.push("-1");
          processedTokens.push("*");
        }
      } else {
        processedTokens.push(tokens[i]);
      }
    }

    const postfix = toPostfix(processedTokens);
    const result = evaluatePostfix(postfix, angleMode, steps);

    if (!Number.isFinite(result)) {
      return { ok: false, error: "Result is undefined or infinite", code: "CALCULATION_ERROR" };
    }

    const formattedResult = Number.isInteger(result)
      ? result.toString()
      : parseFloat(result.toPrecision(precision)).toString();

    steps.push(`Result: ${formattedResult}`);

    return {
      ok: true,
      value: {
        result,
        expression: cleanExpr,
        formattedResult,
        steps,
        variables: { ...CONSTANTS },
      },
    };
  } catch (error) {
    steps.push(`Error: ${error instanceof Error ? error.message : "Invalid expression"}`);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Invalid expression",
      code: "CALCULATION_ERROR",
    };
  }
}
