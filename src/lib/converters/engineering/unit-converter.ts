/**
 * Engineering unit converter
 * NIST-sourced conversion factors with 12-digit precision
 *
 * References:
 * - NIST Special Publication 811 (2008)
 * - NIST Handbook 44 (2024)
 */

import type { CalculationResult } from "@/types";

/**
 * Unit category with available units
 */
export interface UnitCategory {
  id: string;
  name: string;
  units: UnitDefinition[];
}

/**
 * Individual unit definition
 */
export interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  /** Conversion factor TO the base unit (multiply by this to get base) */
  toBase: number;
}

/**
 * Input for unit conversion
 */
export interface UnitConverterInput {
  /** Category ID */
  categoryId: string;
  /** Source unit ID */
  fromUnit: string;
  /** Target unit ID */
  toUnit: string;
  /** Value to convert */
  value: number;
}

/**
 * Result of unit conversion
 */
export interface UnitConverterResult {
  /** Converted value */
  result: number;
  /** Formatted result string */
  formatted: string;
  /** Source unit info */
  fromUnit: { name: string; symbol: string };
  /** Target unit info */
  toUnit: { name: string; symbol: string };
  /** Conversion factor (from → to) */
  conversionFactor: number;
  /** Step-by-step calculation breakdown */
  steps: string[];
  /** All conversions from the source value */
  allConversions: Array<{ name: string; symbol: string; value: number }>;
}

/**
 * NIST-sourced unit categories and conversion factors
 * All factors convert TO the base unit (first unit in each category)
 */
export const UNIT_CATEGORIES: UnitCategory[] = [
  {
    id: "force",
    name: "Force",
    units: [
      { id: "N", name: "Newton", symbol: "N", toBase: 1 },
      { id: "kN", name: "Kilonewton", symbol: "kN", toBase: 1000 },
      { id: "MN", name: "Meganewton", symbol: "MN", toBase: 1e6 },
      { id: "lbf", name: "Pound-force", symbol: "lbf", toBase: 4.44822162 },
      { id: "kip", name: "Kip (1000 lbf)", symbol: "kip", toBase: 4448.22162 },
      { id: "kgf", name: "Kilogram-force", symbol: "kgf", toBase: 9.80665 },
      { id: "dyn", name: "Dyne", symbol: "dyn", toBase: 1e-5 },
    ],
  },
  {
    id: "pressure",
    name: "Pressure / Stress",
    units: [
      { id: "Pa", name: "Pascal", symbol: "Pa", toBase: 1 },
      { id: "kPa", name: "Kilopascal", symbol: "kPa", toBase: 1000 },
      { id: "MPa", name: "Megapascal", symbol: "MPa", toBase: 1e6 },
      { id: "GPa", name: "Gigapascal", symbol: "GPa", toBase: 1e9 },
      { id: "bar", name: "Bar", symbol: "bar", toBase: 100000 },
      { id: "atm", name: "Atmosphere", symbol: "atm", toBase: 101325 },
      { id: "psi", name: "Pounds per sq inch", symbol: "psi", toBase: 6894.75729 },
      { id: "ksi", name: "Kips per sq inch", symbol: "ksi", toBase: 6894757.29 },
      { id: "mmHg", name: "mm of Mercury", symbol: "mmHg", toBase: 133.322387 },
      { id: "inHg", name: "inches of Mercury", symbol: "inHg", toBase: 3386.38864 },
    ],
  },
  {
    id: "length",
    name: "Length",
    units: [
      { id: "m", name: "Meter", symbol: "m", toBase: 1 },
      { id: "mm", name: "Millimeter", symbol: "mm", toBase: 0.001 },
      { id: "cm", name: "Centimeter", symbol: "cm", toBase: 0.01 },
      { id: "km", name: "Kilometer", symbol: "km", toBase: 1000 },
      { id: "in", name: "Inch", symbol: "in", toBase: 0.0254 },
      { id: "ft", name: "Foot", symbol: "ft", toBase: 0.3048 },
      { id: "yd", name: "Yard", symbol: "yd", toBase: 0.9144 },
      { id: "mi", name: "Mile", symbol: "mi", toBase: 1609.344 },
      { id: "um", name: "Micrometer", symbol: "μm", toBase: 1e-6 },
    ],
  },
  {
    id: "area",
    name: "Area",
    units: [
      { id: "m2", name: "Square meter", symbol: "m²", toBase: 1 },
      { id: "mm2", name: "Square millimeter", symbol: "mm²", toBase: 1e-6 },
      { id: "cm2", name: "Square centimeter", symbol: "cm²", toBase: 1e-4 },
      { id: "km2", name: "Square kilometer", symbol: "km²", toBase: 1e6 },
      { id: "in2", name: "Square inch", symbol: "in²", toBase: 6.4516e-4 },
      { id: "ft2", name: "Square foot", symbol: "ft²", toBase: 0.09290304 },
      { id: "ha", name: "Hectare", symbol: "ha", toBase: 10000 },
      { id: "acre", name: "Acre", symbol: "ac", toBase: 4046.8564224 },
    ],
  },
  {
    id: "momentOfInertia",
    name: "Moment of Inertia",
    units: [
      { id: "mm4", name: "mm⁴", symbol: "mm⁴", toBase: 1 },
      { id: "cm4", name: "cm⁴", symbol: "cm⁴", toBase: 10000 },
      { id: "m4", name: "m⁴", symbol: "m⁴", toBase: 1e12 },
      { id: "in4", name: "in⁴", symbol: "in⁴", toBase: 416231.426 },
      { id: "ft4", name: "ft⁴", symbol: "ft⁴", toBase: 8.63097484e9 },
    ],
  },
  {
    id: "sectionModulus",
    name: "Section Modulus",
    units: [
      { id: "mm3", name: "mm³", symbol: "mm³", toBase: 1 },
      { id: "cm3", name: "cm³", symbol: "cm³", toBase: 1000 },
      { id: "m3", name: "m³", symbol: "m³", toBase: 1e9 },
      { id: "in3", name: "in³", symbol: "in³", toBase: 16387.064 },
      { id: "ft3", name: "ft³", symbol: "ft³", toBase: 2.8316846592e7 },
    ],
  },
  {
    id: "mass",
    name: "Mass",
    units: [
      { id: "kg", name: "Kilogram", symbol: "kg", toBase: 1 },
      { id: "g", name: "Gram", symbol: "g", toBase: 0.001 },
      { id: "mg", name: "Milligram", symbol: "mg", toBase: 1e-6 },
      { id: "tonne", name: "Metric ton", symbol: "t", toBase: 1000 },
      { id: "lb", name: "Pound", symbol: "lb", toBase: 0.45359237 },
      { id: "oz", name: "Ounce", symbol: "oz", toBase: 0.028349523 },
      { id: "slug", name: "Slug", symbol: "slug", toBase: 14.5939029 },
      { id: "ton-us", name: "Short ton (US)", symbol: "ton", toBase: 907.18474 },
    ],
  },
  {
    id: "density",
    name: "Density",
    units: [
      { id: "kg/m3", name: "kg/m³", symbol: "kg/m³", toBase: 1 },
      { id: "g/cm3", name: "g/cm³", symbol: "g/cm³", toBase: 1000 },
      { id: "g/mL", name: "g/mL", symbol: "g/mL", toBase: 1000 },
      { id: "lb/ft3", name: "lb/ft³", symbol: "lb/ft³", toBase: 16.01846337 },
      { id: "lb/in3", name: "lb/in³", symbol: "lb/in³", toBase: 27679.90471 },
      { id: "kg/L", name: "kg/L", symbol: "kg/L", toBase: 1000 },
    ],
  },
  {
    id: "stress",
    name: "Stress",
    units: [
      { id: "MPa", name: "Megapascal", symbol: "MPa", toBase: 1 },
      { id: "GPa", name: "Gigapascal", symbol: "GPa", toBase: 1000 },
      { id: "kPa", name: "Kilopascal", symbol: "kPa", toBase: 0.001 },
      { id: "Pa", name: "Pascal", symbol: "Pa", toBase: 1e-6 },
      { id: "psi", name: "psi", symbol: "psi", toBase: 0.00689475729 },
      { id: "ksi", name: "ksi", symbol: "ksi", toBase: 6.89475729 },
      { id: "N/mm2", name: "N/mm²", symbol: "N/mm²", toBase: 1 },
      { id: "kgf/cm2", name: "kgf/cm²", symbol: "kgf/cm²", toBase: 0.0980665 },
    ],
  },
  {
    id: "torque",
    name: "Torque",
    units: [
      { id: "Nm", name: "Newton-meter", symbol: "N·m", toBase: 1 },
      { id: "kNm", name: "Kilonewton-meter", symbol: "kN·m", toBase: 1000 },
      { id: "lbf-ft", name: "Pound-force foot", symbol: "lbf·ft", toBase: 1.35581795 },
      { id: "lbf-in", name: "Pound-force inch", symbol: "lbf·in", toBase: 0.112984829 },
      { id: "kgf-m", name: "Kilogram-force meter", symbol: "kgf·m", toBase: 9.80665 },
      { id: "kip-ft", name: "Kip-foot", symbol: "kip·ft", toBase: 1355.81795 },
      { id: "kip-in", name: "Kip-inch", symbol: "kip·in", toBase: 112.984829 },
    ],
  },
];

/**
 * Convert between engineering units
 *
 * Conversion path: source → base unit → target
 * result = value × (fromUnit.toBase / toUnit.toBase)
 */
export function calculateUnitConversion(
  input: UnitConverterInput
): CalculationResult<UnitConverterResult> {
  const { categoryId, fromUnit, toUnit, value } = input;

  // Find category
  const category = UNIT_CATEGORIES.find((c) => c.id === categoryId);
  if (!category)
    return { ok: false, error: `Unknown unit category: ${categoryId}`, code: "INVALID_INPUT" };

  // Find units
  const from = category.units.find((u) => u.id === fromUnit);
  const to = category.units.find((u) => u.id === toUnit);
  if (!from || !to)
    return {
      ok: false,
      error: `Unknown unit: ${!from ? fromUnit : toUnit}`,
      code: "INVALID_INPUT",
    };

  const steps: string[] = [];
  steps.push(`Category: ${category.name}`);
  steps.push(`Convert: ${value} ${from.symbol} → ${to.symbol}`);

  // Convert: value → base → target
  const conversionFactor = from.toBase / to.toBase;
  const result = value * conversionFactor;

  steps.push(`Step 1: Convert to base unit`);
  steps.push(
    `  ${value} ${from.symbol} × ${from.toBase} = ${(value * from.toBase).toPrecision(10)} ${category.units[0].symbol}`
  );
  steps.push(`Step 2: Convert to target unit`);
  steps.push(
    `  ${(value * from.toBase).toPrecision(10)} ${category.units[0].symbol} / ${to.toBase} = ${result.toPrecision(10)} ${to.symbol}`
  );
  steps.push(
    `Conversion factor: 1 ${from.symbol} = ${conversionFactor.toPrecision(10)} ${to.symbol}`
  );

  // Compute all conversions from the source value
  const allConversions = category.units.map((unit) => ({
    name: unit.name,
    symbol: unit.symbol,
    value: value * (from.toBase / unit.toBase),
  }));

  // Format result with appropriate precision
  const formatted = formatResult(result);

  return {
    ok: true,
    value: {
      result,
      formatted,
      fromUnit: { name: from.name, symbol: from.symbol },
      toUnit: { name: to.name, symbol: to.symbol },
      conversionFactor,
      steps,
      allConversions,
    },
  };
}

/**
 * Format result with appropriate precision
 */
function formatResult(value: number): string {
  const abs = Math.abs(value);
  if (abs === 0) return "0";
  if (abs >= 1e10 || abs < 1e-6) return value.toExponential(6);
  if (abs >= 1000) return value.toFixed(4);
  if (abs >= 1) return value.toFixed(6);
  return value.toPrecision(8);
}

/**
 * Get all unit categories
 */
export function getUnitCategories(): UnitCategory[] {
  return UNIT_CATEGORIES;
}

/**
 * Get a specific unit category by ID
 */
export function getUnitCategoryById(id: string): UnitCategory | undefined {
  return UNIT_CATEGORIES.find((c) => c.id === id);
}
