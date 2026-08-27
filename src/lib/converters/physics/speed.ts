export type SpeedUnit = "ms" | "kmh" | "mph" | "knot" | "fts" | "mach";

export interface SpeedUnitInfo {
  id: SpeedUnit;
  name: string;
  symbol: string;
  toMs: number; // Conversion factor to m/s
}

export const SPEED_UNITS: SpeedUnitInfo[] = [
  { id: "ms", name: "Meters per second", symbol: "m/s", toMs: 1 },
  { id: "kmh", name: "Kilometers per hour", symbol: "km/h", toMs: 1 / 3.6 },
  { id: "mph", name: "Miles per hour", symbol: "mph", toMs: 0.44704 },
  { id: "knot", name: "Knots", symbol: "kn", toMs: 0.514444 },
  { id: "fts", name: "Feet per second", symbol: "ft/s", toMs: 0.3048 },
  { id: "mach", name: "Mach (at sea level)", symbol: "Mach", toMs: 343 },
];

export function getSpeedUnitInfo(unit: SpeedUnit): SpeedUnitInfo | undefined {
  return SPEED_UNITS.find((u) => u.id === unit);
}

export function convertSpeed(value: number, fromUnit: SpeedUnit, toUnit: SpeedUnit): number {
  const from = getSpeedUnitInfo(fromUnit);
  const to = getSpeedUnitInfo(toUnit);

  if (!from || !to) return 0;

  // Convert to m/s first, then to target unit
  const ms = value * from.toMs;
  return ms / to.toMs;
}

export interface SpeedConversion {
  ms: number;
  kmh: number;
  mph: number;
  knot: number;
  fts: number;
  mach: number;
}

export function convertToAllSpeeds(value: number, fromUnit: SpeedUnit): SpeedConversion {
  const ms = convertSpeed(value, fromUnit, "ms");

  return {
    ms,
    kmh: ms * 3.6,
    mph: ms / 0.44704,
    knot: ms / 0.514444,
    fts: ms / 0.3048,
    mach: ms / 343,
  };
}
