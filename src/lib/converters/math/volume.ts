import type { CalculationResult } from "@/types";

export interface VolumeInput {
  shape: "cube" | "rectangular" | "sphere" | "cylinder" | "cone" | "pyramid" | "prism" | "torus";
  // Cube/Rectangular
  length?: number;
  width?: number;
  height?: number;
  // Sphere/Cylinder/Cone
  radius?: number;
  // Torus
  majorRadius?: number;
  minorRadius?: number;
  // Pyramid/Prism
  baseArea?: number;
}

export interface VolumeResult {
  volume: number;
  surfaceArea: number;
  formula: string;
  steps: string[];
  unit: string;
}

export function calculateVolume(input: VolumeInput): CalculationResult<VolumeResult> {
  const { shape } = input;
  let volume: number;
  let surfaceArea: number;
  let formula: string;
  const steps: string[] = [];

  switch (shape) {
    case "cube": {
      const { length } = input;
      if (!length || length <= 0) {
        return {
          ok: false,
          error: "Side length must be a positive number for cube",
          code: "INVALID_INPUT",
        };
      }
      volume = length ** 3;
      surfaceArea = 6 * length ** 2;
      formula = "V = s³";
      steps.push(`V = ${length}³`);
      steps.push(`V = ${volume}`);
      break;
    }

    case "rectangular": {
      const { length, width, height } = input;
      if (!length || !width || !height || length <= 0 || width <= 0 || height <= 0) {
        return {
          ok: false,
          error: "Length, width, and height must be positive numbers for rectangular prism",
          code: "INVALID_INPUT",
        };
      }
      volume = length * width * height;
      surfaceArea = 2 * (length * width + width * height + height * length);
      formula = "V = l × w × h";
      steps.push(`V = ${length} × ${width} × ${height}`);
      steps.push(`V = ${volume}`);
      break;
    }

    case "sphere": {
      const { radius } = input;
      if (!radius || radius <= 0) {
        return {
          ok: false,
          error: "Radius must be a positive number for sphere",
          code: "INVALID_INPUT",
        };
      }
      volume = (4 / 3) * Math.PI * radius ** 3;
      surfaceArea = 4 * Math.PI * radius ** 2;
      formula = "V = (4/3)πr³";
      steps.push(`V = (4/3) × π × ${radius}³`);
      steps.push(`V = (4/3) × π × ${radius ** 3}`);
      steps.push(`V = ${volume.toFixed(6)}`);
      break;
    }

    case "cylinder": {
      const { radius, height } = input;
      if (!radius || !height || radius <= 0 || height <= 0) {
        return {
          ok: false,
          error: "Radius and height must be positive numbers for cylinder",
          code: "INVALID_INPUT",
        };
      }
      volume = Math.PI * radius ** 2 * height;
      surfaceArea = 2 * Math.PI * radius * (radius + height);
      formula = "V = πr²h";
      steps.push(`V = π × ${radius}² × ${height}`);
      steps.push(`V = π × ${radius ** 2} × ${height}`);
      steps.push(`V = ${volume.toFixed(6)}`);
      break;
    }

    case "cone": {
      const { radius, height } = input;
      if (!radius || !height || radius <= 0 || height <= 0) {
        return {
          ok: false,
          error: "Radius and height must be positive numbers for cone",
          code: "INVALID_INPUT",
        };
      }
      volume = (1 / 3) * Math.PI * radius ** 2 * height;
      const slantHeight = Math.sqrt(radius ** 2 + height ** 2);
      surfaceArea = Math.PI * radius * (radius + slantHeight);
      formula = "V = (1/3)πr²h";
      steps.push(`V = (1/3) × π × ${radius}² × ${height}`);
      steps.push(`V = ${volume.toFixed(6)}`);
      break;
    }

    case "pyramid": {
      const { baseArea, height } = input;
      if (!baseArea || !height || baseArea <= 0 || height <= 0) {
        return {
          ok: false,
          error: "Base area and height must be positive numbers for pyramid",
          code: "INVALID_INPUT",
        };
      }
      volume = (1 / 3) * baseArea * height;
      // Surface area requires more info about the base shape
      surfaceArea = baseArea; // Base only, lateral faces would need more info
      formula = "V = (1/3) × Base Area × h";
      steps.push(`V = (1/3) × ${baseArea} × ${height}`);
      steps.push(`V = ${volume.toFixed(6)}`);
      break;
    }

    case "prism": {
      const { baseArea, height } = input;
      if (!baseArea || !height || baseArea <= 0 || height <= 0) {
        return {
          ok: false,
          error: "Base area and height must be positive numbers for prism",
          code: "INVALID_INPUT",
        };
      }
      volume = baseArea * height;
      surfaceArea = 2 * baseArea; // Top and bottom only
      formula = "V = Base Area × h";
      steps.push(`V = ${baseArea} × ${height}`);
      steps.push(`V = ${volume}`);
      break;
    }

    case "torus": {
      const { majorRadius, minorRadius } = input;
      if (!majorRadius || !minorRadius || majorRadius <= 0 || minorRadius <= 0) {
        return {
          ok: false,
          error: "Major radius and minor radius must be positive numbers for torus",
          code: "INVALID_INPUT",
        };
      }
      if (minorRadius >= majorRadius) {
        return {
          ok: false,
          error: "Minor radius must be less than major radius for a valid torus",
          code: "INVALID_INPUT",
        };
      }
      volume = 2 * Math.PI * Math.PI * majorRadius * minorRadius ** 2;
      surfaceArea = 4 * Math.PI * Math.PI * majorRadius * minorRadius;
      formula = "V = 2π²Rr²";
      steps.push(`V = 2π² × ${majorRadius} × ${minorRadius}²`);
      steps.push(`V = ${volume.toFixed(6)}`);
      break;
    }

    default:
      return { ok: false, error: "Unknown shape specified", code: "INVALID_INPUT" };
  }

  return {
    ok: true,
    value: {
      volume,
      surfaceArea,
      formula,
      steps,
      unit: "cubic units",
    },
  };
}
