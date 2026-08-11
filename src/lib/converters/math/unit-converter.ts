/**
 * Unit Converter
 *
 * Comprehensive unit converter across 11 categories including physical units.
 * Each category converts through a base unit (except temperature, which is
 * handled with affine conversions via Kelvin).
 */

import type { CalculationResult } from "@/types";

export type UnitCategory =
  | "length"
  | "mass"
  | "temperature"
  | "area"
  | "volume"
  | "speed"
  | "time"
  | "data"
  | "energy"
  | "power"
  | "pressure";

export interface UnitDef {
  value: string;
  label: string;
  /** Conversion factor to the category base unit (unused for temperature). */
  factor: number;
}

export interface UnitCategoryDef {
  id: UnitCategory;
  label: string;
  units: UnitDef[];
}

export const UNIT_CATEGORIES: Record<UnitCategory, UnitCategoryDef> = {
  length: {
    id: "length",
    label: "Length",
    units: [
      { value: "m", label: "Meter (m)", factor: 1 },
      { value: "km", label: "Kilometer (km)", factor: 1000 },
      { value: "cm", label: "Centimeter (cm)", factor: 0.01 },
      { value: "mm", label: "Millimeter (mm)", factor: 0.001 },
      { value: "um", label: "Micrometer (µm)", factor: 1e-6 },
      { value: "nm", label: "Nanometer (nm)", factor: 1e-9 },
      { value: "mi", label: "Mile (mi)", factor: 1609.344 },
      { value: "yd", label: "Yard (yd)", factor: 0.9144 },
      { value: "ft", label: "Foot (ft)", factor: 0.3048 },
      { value: "in", label: "Inch (in)", factor: 0.0254 },
      { value: "nmi", label: "Nautical mile (nmi)", factor: 1852 },
    ],
  },
  mass: {
    id: "mass",
    label: "Mass",
    units: [
      { value: "kg", label: "Kilogram (kg)", factor: 1 },
      { value: "g", label: "Gram (g)", factor: 0.001 },
      { value: "mg", label: "Milligram (mg)", factor: 1e-6 },
      { value: "t", label: "Metric ton (t)", factor: 1000 },
      { value: "lb", label: "Pound (lb)", factor: 0.45359237 },
      { value: "oz", label: "Ounce (oz)", factor: 0.028349523125 },
      { value: "st", label: "Stone (st)", factor: 6.35029318 },
      { value: "ton", label: "US ton (short)", factor: 907.18474 },
    ],
  },
  temperature: {
    id: "temperature",
    label: "Temperature",
    units: [
      { value: "c", label: "Celsius (°C)", factor: 1 },
      { value: "f", label: "Fahrenheit (°F)", factor: 1 },
      { value: "k", label: "Kelvin (K)", factor: 1 },
    ],
  },
  area: {
    id: "area",
    label: "Area",
    units: [
      { value: "m2", label: "Square meter (m²)", factor: 1 },
      { value: "km2", label: "Square kilometer (km²)", factor: 1e6 },
      { value: "cm2", label: "Square centimeter (cm²)", factor: 1e-4 },
      { value: "mm2", label: "Square millimeter (mm²)", factor: 1e-6 },
      { value: "ha", label: "Hectare (ha)", factor: 10000 },
      { value: "acre", label: "Acre", factor: 4046.8564224 },
      { value: "ft2", label: "Square foot (ft²)", factor: 0.09290304 },
      { value: "in2", label: "Square inch (in²)", factor: 0.00064516 },
      { value: "mi2", label: "Square mile (mi²)", factor: 2589988.110336 },
    ],
  },
  volume: {
    id: "volume",
    label: "Volume",
    units: [
      { value: "l", label: "Liter (L)", factor: 1 },
      { value: "ml", label: "Milliliter (mL)", factor: 0.001 },
      { value: "m3", label: "Cubic meter (m³)", factor: 1000 },
      { value: "cm3", label: "Cubic centimeter (cm³)", factor: 0.001 },
      { value: "gal", label: "US gallon (gal)", factor: 3.785411784 },
      { value: "qt", label: "US quart (qt)", factor: 0.946352946 },
      { value: "pt", label: "US pint (pt)", factor: 0.473176473 },
      { value: "cup", label: "US cup", factor: 0.2365882365 },
      { value: "floz", label: "US fluid ounce (fl oz)", factor: 0.0295735295625 },
      { value: "tbsp", label: "Tablespoon (tbsp)", factor: 0.01478676478125 },
      { value: "tsp", label: "Teaspoon (tsp)", factor: 0.00492892159375 },
      { value: "ft3", label: "Cubic foot (ft³)", factor: 28.316846592 },
      { value: "in3", label: "Cubic inch (in³)", factor: 0.016387064 },
    ],
  },
  speed: {
    id: "speed",
    label: "Speed",
    units: [
      { value: "mps", label: "Meter/second (m/s)", factor: 1 },
      { value: "kmh", label: "Kilometer/hour (km/h)", factor: 0.2777777777777778 },
      { value: "mph", label: "Mile/hour (mph)", factor: 0.44704 },
      { value: "ftps", label: "Foot/second (ft/s)", factor: 0.3048 },
      { value: "knot", label: "Knot (kn)", factor: 0.5144444444444444 },
    ],
  },
  time: {
    id: "time",
    label: "Time",
    units: [
      { value: "s", label: "Second (s)", factor: 1 },
      { value: "ms", label: "Millisecond (ms)", factor: 0.001 },
      { value: "min", label: "Minute (min)", factor: 60 },
      { value: "h", label: "Hour (h)", factor: 3600 },
      { value: "day", label: "Day (d)", factor: 86400 },
      { value: "week", label: "Week (wk)", factor: 604800 },
    ],
  },
  data: {
    id: "data",
    label: "Data",
    units: [
      { value: "b", label: "Bit (bit)", factor: 0.125 },
      { value: "B", label: "Byte (B)", factor: 1 },
      { value: "KB", label: "Kilobyte (KB)", factor: 1000 },
      { value: "MB", label: "Megabyte (MB)", factor: 1e6 },
      { value: "GB", label: "Gigabyte (GB)", factor: 1e9 },
      { value: "TB", label: "Terabyte (TB)", factor: 1e12 },
      { value: "KiB", label: "Kibibyte (KiB)", factor: 1024 },
      { value: "MiB", label: "Mebibyte (MiB)", factor: 1048576 },
      { value: "GiB", label: "Gibibyte (GiB)", factor: 1073741824 },
      { value: "TiB", label: "Tebibyte (TiB)", factor: 1099511627776 },
    ],
  },
  energy: {
    id: "energy",
    label: "Energy",
    units: [
      { value: "J", label: "Joule (J)", factor: 1 },
      { value: "kJ", label: "Kilojoule (kJ)", factor: 1000 },
      { value: "cal", label: "Calorie (cal)", factor: 4.184 },
      { value: "kcal", label: "Kilocalorie (kcal)", factor: 4184 },
      { value: "Wh", label: "Watt-hour (Wh)", factor: 3600 },
      { value: "kWh", label: "Kilowatt-hour (kWh)", factor: 3.6e6 },
      { value: "eV", label: "Electronvolt (eV)", factor: 1.602176634e-19 },
      { value: "BTU", label: "British thermal unit (BTU)", factor: 1055.05585262 },
    ],
  },
  power: {
    id: "power",
    label: "Power",
    units: [
      { value: "W", label: "Watt (W)", factor: 1 },
      { value: "kW", label: "Kilowatt (kW)", factor: 1000 },
      { value: "MW", label: "Megawatt (MW)", factor: 1e6 },
      { value: "hp", label: "Mechanical horsepower (hp)", factor: 745.6998715823 },
      { value: "ftlbs", label: "Foot-pound/second", factor: 1.3558179483 },
    ],
  },
  pressure: {
    id: "pressure",
    label: "Pressure",
    units: [
      { value: "Pa", label: "Pascal (Pa)", factor: 1 },
      { value: "kPa", label: "Kilopascal (kPa)", factor: 1000 },
      { value: "MPa", label: "Megapascal (MPa)", factor: 1e6 },
      { value: "bar", label: "Bar", factor: 1e5 },
      { value: "mbar", label: "Millibar (mbar)", factor: 100 },
      { value: "atm", label: "Atmosphere (atm)", factor: 101325 },
      { value: "psi", label: "Pound/inch² (psi)", factor: 6894.757293168 },
      { value: "mmHg", label: "Millimeter of mercury (mmHg)", factor: 133.322387415 },
    ],
  },
};

export const UNIT_CATEGORY_ORDER: UnitCategory[] = [
  "length",
  "mass",
  "temperature",
  "area",
  "volume",
  "speed",
  "time",
  "data",
  "energy",
  "power",
  "pressure",
];

/** Convert a temperature value (in `unit`) to Kelvin. */
function toKelvin(value: number, unit: string): number {
  if (unit === "c") return value + 273.15;
  if (unit === "f") return ((value - 32) * 5) / 9 + 273.15;
  return value; // kelvin
}

/** Convert a Kelvin value to `unit`. */
function fromKelvin(kelvin: number, unit: string): number {
  if (unit === "c") return kelvin - 273.15;
  if (unit === "f") return ((kelvin - 273.15) * 9) / 5 + 32;
  return kelvin;
}

/** Format a number for display: integers stay integer, others get up to 10 sig figs. */
export function formatUnitNumber(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (Number.isInteger(n)) return n.toLocaleString("en-US");
  const abs = Math.abs(n);
  const decimals = abs !== 0 && abs < 1e-4 ? 12 : 8;
  return parseFloat(n.toPrecision(10)).toLocaleString("en-US", {
    maximumFractionDigits: decimals,
  });
}

export interface UnitConverterInput {
  category: UnitCategory;
  value: number;
  from: string;
  to: string;
}

export interface UnitConverterResult {
  result: number;
  fromLabel: string;
  toLabel: string;
  formatted: string;
}

/**
 * Convert `value` expressed in `from` units to `to` units within a category.
 *
 * @param input - category, numeric value, source unit, target unit
 * @returns The converted value with display metadata
 */
export function calculateUnitConverter(
  input: UnitConverterInput
): CalculationResult<UnitConverterResult> {
  const { category, value, from, to } = input;

  if (value === null || value === undefined || Number.isNaN(value)) {
    return { ok: false, error: "Enter a valid number", code: "INVALID_INPUT" };
  }

  const cat = UNIT_CATEGORIES[category];
  if (!cat) {
    return { ok: false, error: "Unknown category", code: "INVALID_INPUT" };
  }

  const fromUnit = cat.units.find((u) => u.value === from);
  const toUnit = cat.units.find((u) => u.value === to);
  if (!fromUnit || !toUnit) {
    return { ok: false, error: "Unknown unit", code: "INVALID_INPUT" };
  }

  let result: number;
  if (category === "temperature") {
    const kelvin = toKelvin(value, from);
    result = fromKelvin(kelvin, to);
  } else {
    result = (value * fromUnit.factor) / toUnit.factor;
  }

  return {
    ok: true,
    value: {
      result,
      fromLabel: fromUnit.label,
      toLabel: toUnit.label,
      formatted: formatUnitNumber(result),
    },
  };
}
