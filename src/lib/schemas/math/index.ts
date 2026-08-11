import { z } from "zod";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Validate a string represents any real number (including negative) */
const numStr = (label: string) =>
  z.string().refine((v) => v !== "" && !Number.isNaN(Number(v)), {
    message: `${label} must be a number`,
  });

/** Validate a string represents a positive number */
const posNumStr = (label: string) =>
  z
    .string()
    .refine((v) => v !== "" && !Number.isNaN(Number(v)), {
      message: `${label} must be a number`,
    })
    .refine((v) => Number(v) > 0, {
      message: `${label} must be positive`,
    });

/** Validate a string represents a non-negative number */
const nonNegNumStr = (label: string) =>
  z
    .string()
    .refine((v) => v !== "" && !Number.isNaN(Number(v)), {
      message: `${label} must be a number`,
    })
    .refine((v) => Number(v) >= 0, {
      message: `${label} must be non-negative`,
    });

/** Validate a string represents a positive integer */
const posIntStr = (label: string) =>
  z
    .string()
    .refine((v) => v !== "" && !Number.isNaN(Number(v)), {
      message: `${label} must be a number`,
    })
    .refine((v) => Number.isInteger(Number(v)) && Number(v) > 0, {
      message: `${label} must be a positive whole number`,
    });

/** Validate a string represents a number within a range */
const numStrRange = (label: string, min: number, max: number) =>
  z
    .string()
    .refine((v) => v !== "" && !Number.isNaN(Number(v)), {
      message: `${label} must be a number`,
    })
    .refine(
      (v) => {
        const n = Number(v);
        return n >= min && n <= max;
      },
      {
        message: `${label} must be between ${min} and ${max}`,
      }
    );

/** Validate a string represents a probability (0 to 1) */
const probabilityStr = (label: string) => numStrRange(label, 0, 1);

// ─── Area Calculator ──────────────────────────────────────────────────────────
export const AreaFormSchema = z.object({
  shape: z.enum([
    "rectangle",
    "square",
    "triangle",
    "circle",
    "trapezoid",
    "parallelogram",
    "ellipse",
    "sector",
    "rhombus",
  ]),
  length: posNumStr("Length"),
  width: posNumStr("Width"),
  base: posNumStr("Base"),
  height: posNumStr("Height"),
  radius: posNumStr("Radius"),
  radiusA: posNumStr("Semi-major axis"),
  radiusB: posNumStr("Semi-minor axis"),
  base1: posNumStr("Base 1"),
  base2: posNumStr("Base 2"),
  angle: numStrRange("Angle", 0, 360),
  diagonal1: posNumStr("Diagonal 1"),
  diagonal2: posNumStr("Diagonal 2"),
});

// ─── Binary Calculator ────────────────────────────────────────────────────────
export const BinaryFormSchema = z.object({
  mode: z.enum(["decimalToBinary", "binaryToDecimal", "binaryOperation"]),
  decimal: numStr("Decimal"),
  binary: z
    .string()
    .min(1, "Binary number is required")
    .regex(/^[01]+$/, "Must be binary (0s and 1s only)"),
  binary2: z
    .string()
    .min(1, "Binary number 2 is required")
    .regex(/^[01]+$/, "Must be binary (0s and 1s only)"),
  operation: z.enum(["add", "subtract", "multiply", "and", "or", "xor", "not"]),
});

// ─── Circle Calculator ────────────────────────────────────────────────────────
export const CircleFormSchema = z.object({
  mode: z.enum(["radius", "diameter", "circumference", "area"]),
  value: posNumStr("Value"),
});

// ─── Confidence Interval Calculator ──────────────────────────────────────────
export const ConfidenceIntervalFormSchema = z.object({
  mode: z.enum(["mean", "proportion"]),
  sampleMean: numStr("Sample mean"),
  sampleSize: posIntStr("Sample size"),
  standardDeviation: posNumStr("Standard deviation"),
  confidenceLevel: z.string().min(1, "Confidence level is required"),
  successes: nonNegNumStr("Successes"),
});

// ─── Distance Calculator ──────────────────────────────────────────────────────
export const DistanceFormSchema = z.object({
  mode: z.enum(["twoPoints2D", "twoPoints3D", "pointToLine", "manhattan", "haversine"]),
  x1: numStr("X1"),
  y1: numStr("Y1"),
  x2: numStr("X2"),
  y2: numStr("Y2"),
  z1: numStr("Z1"),
  z2: numStr("Z2"),
  lineA: numStr("Line coefficient A"),
  lineB: numStr("Line coefficient B"),
  lineC: numStr("Line coefficient C"),
  lat1: numStrRange("Latitude 1", -90, 90),
  lon1: numStrRange("Longitude 1", -180, 180),
  lat2: numStrRange("Latitude 2", -90, 90),
  lon2: numStrRange("Longitude 2", -180, 180),
});

// ─── Exponent Calculator ──────────────────────────────────────────────────────
export const ExponentFormSchema = z.object({
  base: numStr("Base"),
  exponent: numStr("Exponent"),
});

// ─── Factor Calculator ────────────────────────────────────────────────────────
export const FactorFormSchema = z.object({
  number: posIntStr("Number"),
});

// ─── Fraction Calculator ──────────────────────────────────────────────────────
export const FractionFormSchema = z.object({
  mode: z.enum(["simplify", "add", "subtract", "multiply", "divide", "toDecimal", "toFraction"]),
  numerator1: numStr("Numerator 1"),
  denominator1: z
    .string()
    .refine((v) => v !== "" && !Number.isNaN(Number(v)), {
      message: "Denominator 1 must be a number",
    })
    .refine((v) => Number(v) !== 0, { message: "Denominator 1 cannot be zero" }),
  numerator2: numStr("Numerator 2"),
  denominator2: z
    .string()
    .refine((v) => v !== "" && !Number.isNaN(Number(v)), {
      message: "Denominator 2 must be a number",
    })
    .refine((v) => Number(v) !== 0, { message: "Denominator 2 cannot be zero" }),
  decimal: numStr("Decimal"),
});

// ─── Half-Life Calculator ─────────────────────────────────────────────────────
export const HalfLifeFormSchema = z.object({
  mode: z.enum(["decay", "remaining", "findHalfLife", "carbon14"]),
  initialAmount: nonNegNumStr("Initial amount"),
  remainingAmount: nonNegNumStr("Remaining amount"),
  halfLife: posNumStr("Half-life"),
  time: nonNegNumStr("Time elapsed"),
  percentRemaining: numStrRange("Percent remaining", 0.1, 100),
});

// ─── Hex Calculator ───────────────────────────────────────────────────────────
export const HexFormSchema = z.object({
  mode: z.enum(["decimalToHex", "hexToDecimal", "hexOperation", "hexToRgb", "rgbToHex"]),
  decimal: numStr("Decimal"),
  hex: z
    .string()
    .min(1, "Hex value is required")
    .regex(/^[0-9a-fA-F#]+$/, "Must be hexadecimal"),
  hex2: z
    .string()
    .min(1, "Hex value 2 is required")
    .regex(/^[0-9a-fA-F]+$/, "Must be hexadecimal"),
  operation: z.enum(["add", "subtract", "multiply", "and", "or", "xor"]),
  r: numStrRange("Red channel", 0, 255),
  g: numStrRange("Green channel", 0, 255),
  b: numStrRange("Blue channel", 0, 255),
});

// ─── Logarithm Calculator ─────────────────────────────────────────────────────
export const LogarithmFormSchema = z.object({
  value: posNumStr("Value"),
  base: posNumStr("Base"),
});

// ─── Long Division Calculator ─────────────────────────────────────────────────
export const LongDivisionFormSchema = z.object({
  dividend: numStr("Dividend"),
  divisor: z
    .string()
    .refine((v) => v !== "" && !Number.isNaN(Number(v)), { message: "Divisor must be a number" })
    .refine((v) => Number(v) !== 0, { message: "Divisor cannot be zero" }),
  decimalPlaces: numStrRange("Decimal places", 0, 50),
});

// ─── P-Value Calculator ───────────────────────────────────────────────────────
export const PValueFormSchema = z.object({
  mode: z.enum(["fromZScore", "fromTScore", "fromChiSquare", "fromFScore"]),
  testStatistic: numStr("Test statistic"),
  degreesOfFreedom: posIntStr("Degrees of freedom"),
  degreesOfFreedom2: posIntStr("Degrees of freedom 2"),
  twoTailed: z.boolean(),
});

// ─── Percent Error Calculator ─────────────────────────────────────────────────
export const PercentErrorFormSchema = z.object({
  experimental: numStr("Experimental value"),
  theoretical: z
    .string()
    .refine((v) => v !== "" && !Number.isNaN(Number(v)), {
      message: "Theoretical value must be a number",
    })
    .refine((v) => Number(v) !== 0, { message: "Theoretical value cannot be zero" }),
});

// ─── Percentage Calculator ────────────────────────────────────────────────────
export const PercentageFormSchema = z.object({
  mode: z.enum(["percentOf", "whatPercent", "percentChange", "percentDifference"]),
  value1: numStr("Value 1"),
  value2: numStr("Value 2"),
});

// ─── Permutation/Combination Calculator ──────────────────────────────────────
export const PermutationCombinationFormSchema = z.object({
  mode: z.enum(["permutation", "combination", "permutationRepetition", "combinationRepetition"]),
  n: nonNegNumStr("Total items (n)"),
  r: nonNegNumStr("Items to choose (r)"),
});

// ─── Prime Factorization Calculator ──────────────────────────────────────────
export const PrimeFactorizationFormSchema = z.object({
  number: posIntStr("Number"),
});

// ─── Probability Calculator ───────────────────────────────────────────────────
export const ProbabilityFormSchema = z.object({
  mode: z.enum([
    "single",
    "and",
    "or",
    "conditional",
    "complement",
    "binomial",
    "permutation",
    "combination",
  ]),
  probabilityA: probabilityStr("Probability A"),
  probabilityB: probabilityStr("Probability B"),
  probabilityAandB: probabilityStr("P(A and B)"),
  n: nonNegNumStr("Total items (n)"),
  r: nonNegNumStr("Selected items (r)"),
  trials: posIntStr("Trials"),
  successes: nonNegNumStr("Successes"),
});

// ─── Pythagorean Calculator ───────────────────────────────────────────────────
export const PythagoreanFormSchema = z.object({
  mode: z.enum(["findHypotenuse", "findLeg"]),
  sideA: posNumStr("Side A"),
  sideB: posNumStr("Side B"),
  hypotenuse: posNumStr("Hypotenuse"),
});

// ─── Quadratic Calculator ─────────────────────────────────────────────────────
export const QuadraticFormSchema = z.object({
  a: z
    .string()
    .refine((v) => v !== "" && !Number.isNaN(Number(v)), {
      message: "Coefficient a must be a number",
    })
    .refine((v) => Number(v) !== 0, { message: "Coefficient a cannot be zero" }),
  b: numStr("Coefficient b"),
  c: numStr("Coefficient c"),
});

// ─── Random Number Calculator ─────────────────────────────────────────────────
// Note: RandomNumberCalculator uses useState directly (not createCalculatorStore)
// Schema included for completeness but not wired to a store
export const RandomNumberFormSchema = z.object({
  mode: z.enum(["integer", "float", "multiple", "dice"]),
  min: numStr("Minimum"),
  max: numStr("Maximum"),
  count: posIntStr("Count"),
  diceSides: posIntStr("Dice sides"),
  diceCount: posIntStr("Dice count"),
});

// ─── Ratio Calculator ─────────────────────────────────────────────────────────
export const RatioFormSchema = z.object({
  mode: z.enum(["simplify", "scale", "findMissing", "compare"]),
  a: numStr("A"),
  b: numStr("B"),
  c: numStr("C"),
  d: z.string(),
  scaleFactor: numStr("Scale factor"),
  targetValue: numStr("Target value"),
});

// ─── Root Calculator ──────────────────────────────────────────────────────────
export const RootFormSchema = z.object({
  radicand: numStr("Radicand"),
  index: posNumStr("Index"),
});

// ─── Rounding Calculator ──────────────────────────────────────────────────────
export const RoundingFormSchema = z.object({
  mode: z.enum(["round", "ceil", "floor", "truncate", "toFixed", "toSignificant"]),
  number: numStr("Number"),
  decimalPlaces: numStrRange("Decimal places", 0, 15),
  significantFigures: numStrRange("Significant figures", 1, 15),
});

// ─── Sample Size Calculator ───────────────────────────────────────────────────
export const SampleSizeFormSchema = z.object({
  mode: z.enum(["proportion", "mean"]),
  confidenceLevel: z.string().min(1, "Confidence level is required"),
  marginOfError: numStrRange("Margin of error", 0.1, 50),
  populationProportion: numStrRange("Population proportion", 1, 99),
  populationSize: z.string(),
  standardDeviation: posNumStr("Standard deviation"),
});

// ─── Scientific Notation Calculator ──────────────────────────────────────────
export const ScientificNotationFormSchema = z.object({
  mode: z.enum(["toScientific", "fromScientific"]),
  number: numStr("Number"),
  mantissa: numStr("Mantissa"),
  exponent: numStr("Exponent"),
});

// ─── Slope Calculator ─────────────────────────────────────────────────────────
export const SlopeFormSchema = z.object({
  mode: z.enum(["twoPoints", "slopeIntercept", "pointSlope"]),
  x1: numStr("X1"),
  y1: numStr("Y1"),
  x2: numStr("X2"),
  y2: numStr("Y2"),
  slope: numStr("Slope"),
  yIntercept: numStr("Y-intercept"),
});

// ─── Standard Deviation Calculator ───────────────────────────────────────────
// Note: StandardDeviationCalculator uses useState directly (not createCalculatorStore)
// Schema included for completeness but not wired to a store
export const StandardDeviationFormSchema = z.object({
  data: z.string().min(1, "Data values are required"),
  isPopulation: z.boolean(),
});

// ─── Statistics Calculator ────────────────────────────────────────────────────
// Note: StatisticsCalculator uses useState directly (not createCalculatorStore)
// Schema included for completeness but not wired to a store
export const StatisticsFormSchema = z.object({
  data: z.string().min(1, "Data values are required"),
  population: z.boolean(),
});

// ─── Surface Area Calculator ──────────────────────────────────────────────────
export const SurfaceAreaFormSchema = z.object({
  shape: z.enum([
    "cube",
    "rectangularPrism",
    "sphere",
    "cylinder",
    "cone",
    "pyramid",
    "triangularPrism",
    "hemisphere",
  ]),
  side: posNumStr("Side length"),
  length: posNumStr("Length"),
  width: posNumStr("Width"),
  height: posNumStr("Height"),
  radius: posNumStr("Radius"),
  slantHeight: posNumStr("Slant height"),
  baseLength: posNumStr("Base length"),
  baseWidth: posNumStr("Base width"),
  triangleBase: posNumStr("Triangle base"),
  triangleHeight: posNumStr("Triangle height"),
  prismLength: posNumStr("Prism length"),
});

// ─── Triangle Calculator ──────────────────────────────────────────────────────
export const TriangleFormSchema = z.object({
  mode: z.enum(["sides", "sasAngle", "asaAngles", "aasAngles"]),
  sideA: posNumStr("Side A"),
  sideB: posNumStr("Side B"),
  sideC: posNumStr("Side C"),
  angleA: numStrRange("Angle A", 0.0001, 179.9999),
  angleB: numStrRange("Angle B", 0.0001, 179.9999),
  angleC: numStrRange("Angle C", 0.0001, 179.9999),
});

// ─── Volume Calculator ────────────────────────────────────────────────────────
export const VolumeFormSchema = z.object({
  shape: z.enum(["cube", "rectangular", "sphere", "cylinder", "cone", "pyramid", "prism", "torus"]),
  length: posNumStr("Length"),
  width: posNumStr("Width"),
  height: posNumStr("Height"),
  radius: posNumStr("Radius"),
  majorRadius: posNumStr("Major radius"),
  minorRadius: posNumStr("Minor radius"),
  baseArea: posNumStr("Base area"),
});

// ─── Z-Score Calculator ───────────────────────────────────────────────────────
export const ZScoreFormSchema = z.object({
  mode: z.enum(["calculate", "fromZScore", "probability"]),
  value: numStr("Value"),
  mean: numStr("Mean"),
  standardDeviation: posNumStr("Standard deviation"),
  zScore: numStr("Z-score"),
});

// ─── Average Calculator ───────────────────────────────────────────────────────
// Note: AverageCalculator uses useState directly (not createCalculatorStore)
// Schema included for completeness but not wired to a store
export const AverageFormSchema = z.object({
  numbers: z.string().min(1, "Numbers are required"),
});

// ─── Big Number Calculator ────────────────────────────────────────────────────
// Note: BigNumberCalculator uses useState directly (not createCalculatorStore)
// Schema included for completeness but not wired to a store
export const BigNumberFormSchema = z.object({
  mode: z.enum(["add", "subtract", "multiply", "divide", "power", "factorial", "compare"]),
  numberA: z.string().min(1, "Number A is required"),
  numberB: z.string().min(1, "Number B is required"),
  precision: z.number().int().min(1).max(50),
});

// ─── GCD/LCM Calculator ───────────────────────────────────────────────────────
// Note: GcdLcmCalculator uses useState directly (not createCalculatorStore)
// Schema included for completeness but not wired to a store
export const GcdLcmFormSchema = z.object({
  numbers: z.string().min(1, "Numbers are required"),
});

// ─── Matrix Calculator ────────────────────────────────────────────────────────
// Note: MatrixCalculator uses useState directly (not createCalculatorStore)
// Schema included for completeness but not wired to a store
export const MatrixFormSchema = z.object({
  mode: z.enum(["add", "subtract", "multiply", "transpose", "determinant", "inverse", "scalar"]),
  matrixAText: z.string().min(1, "Matrix A is required"),
  matrixBText: z.string().min(1, "Matrix B is required"),
  scalar: z.number(),
});

// ─── Number Sequence Calculator ───────────────────────────────────────────────
// Note: NumberSequenceCalculator uses useState directly (not createCalculatorStore)
// Schema included for completeness but not wired to a store
export const NumberSequenceFormSchema = z.object({
  mode: z.enum(["arithmetic", "geometric", "fibonacci", "custom", "findPattern"]),
  firstTerm: z.number(),
  commonDifference: z.number(),
  commonRatio: z.number(),
  numberOfTerms: z.number().int().min(1).max(100),
  customTerms: z.string(),
});
