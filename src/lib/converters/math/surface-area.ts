import type { CalculationResult } from "@/types";

export interface SurfaceAreaInput {
  shape:
    | "cube"
    | "rectangularPrism"
    | "sphere"
    | "cylinder"
    | "cone"
    | "pyramid"
    | "triangularPrism"
    | "hemisphere";
  // Cube
  side?: number;
  // Rectangular prism
  length?: number;
  width?: number;
  height?: number;
  // Sphere / Hemisphere
  radius?: number;
  // Cone
  slantHeight?: number;
  // Pyramid
  baseLength?: number;
  baseWidth?: number;
  // Triangular prism
  triangleBase?: number;
  triangleHeight?: number;
  prismLength?: number;
  side1?: number;
  side2?: number;
  side3?: number;
}

export interface SurfaceAreaResult {
  shape: string;
  totalSurfaceArea: number;
  lateralSurfaceArea: number;
  baseSurfaceArea: number;
  formula: string;
  steps: string[];
  unit: string;
}

export function calculateSurfaceArea(
  input: SurfaceAreaInput
): CalculationResult<SurfaceAreaResult> {
  const { shape } = input;
  const steps: string[] = [];
  let totalSurfaceArea: number;
  let lateralSurfaceArea: number;
  let baseSurfaceArea: number;
  let formula: string;
  let shapeName: string;

  switch (shape) {
    case "cube": {
      const { side } = input;
      if (side === undefined || side <= 0) {
        return {
          ok: false,
          error: "Side length must be a positive number for cube",
          code: "INVALID_INPUT",
        };
      }

      shapeName = "Cube";
      totalSurfaceArea = 6 * side * side;
      lateralSurfaceArea = 4 * side * side;
      baseSurfaceArea = side * side;
      formula = "SA = 6s²";

      steps.push(`Side length (s) = ${side}`);
      steps.push(`Surface Area = 6 × s²`);
      steps.push(`= 6 × ${side}²`);
      steps.push(`= 6 × ${side * side}`);
      steps.push(`= ${totalSurfaceArea}`);
      break;
    }

    case "rectangularPrism": {
      const { length, width, height } = input;
      if (!length || !width || !height || length <= 0 || width <= 0 || height <= 0) {
        return {
          ok: false,
          error: "Length, width, and height must be positive numbers for rectangular prism",
          code: "INVALID_INPUT",
        };
      }

      shapeName = "Rectangular Prism";
      totalSurfaceArea = 2 * (length * width + width * height + height * length);
      lateralSurfaceArea = 2 * height * (length + width);
      baseSurfaceArea = length * width;
      formula = "SA = 2(lw + wh + hl)";

      steps.push(`Length (l) = ${length}, Width (w) = ${width}, Height (h) = ${height}`);
      steps.push(`Surface Area = 2(lw + wh + hl)`);
      steps.push(`= 2(${length}×${width} + ${width}×${height} + ${height}×${length})`);
      steps.push(`= 2(${length * width} + ${width * height} + ${height * length})`);
      steps.push(`= ${totalSurfaceArea}`);
      break;
    }

    case "sphere": {
      const { radius } = input;
      if (radius === undefined || radius <= 0) {
        return {
          ok: false,
          error: "Radius must be a positive number for sphere",
          code: "INVALID_INPUT",
        };
      }

      shapeName = "Sphere";
      totalSurfaceArea = 4 * Math.PI * radius * radius;
      lateralSurfaceArea = totalSurfaceArea; // All surface is "lateral" for a sphere
      baseSurfaceArea = 0;
      formula = "SA = 4πr²";

      steps.push(`Radius (r) = ${radius}`);
      steps.push(`Surface Area = 4πr²`);
      steps.push(`= 4 × π × ${radius}²`);
      steps.push(`= 4 × π × ${radius * radius}`);
      steps.push(`= ${totalSurfaceArea.toFixed(6)}`);
      break;
    }

    case "cylinder": {
      const { radius, height } = input;
      if (radius === undefined || height === undefined || radius <= 0 || height <= 0) {
        return {
          ok: false,
          error: "Radius and height must be positive numbers for cylinder",
          code: "INVALID_INPUT",
        };
      }

      shapeName = "Cylinder";
      lateralSurfaceArea = 2 * Math.PI * radius * height;
      baseSurfaceArea = Math.PI * radius * radius;
      totalSurfaceArea = lateralSurfaceArea + 2 * baseSurfaceArea;
      formula = "SA = 2πrh + 2πr²";

      steps.push(`Radius (r) = ${radius}, Height (h) = ${height}`);
      steps.push(`Lateral Surface Area = 2πrh = ${lateralSurfaceArea.toFixed(6)}`);
      steps.push(`Base Area = πr² = ${baseSurfaceArea.toFixed(6)}`);
      steps.push(`Total Surface Area = 2πrh + 2πr²`);
      steps.push(`= ${totalSurfaceArea.toFixed(6)}`);
      break;
    }

    case "cone": {
      const { radius, slantHeight } = input;
      if (radius === undefined || slantHeight === undefined || radius <= 0 || slantHeight <= 0) {
        return {
          ok: false,
          error: "Radius and slant height must be positive numbers for cone",
          code: "INVALID_INPUT",
        };
      }

      shapeName = "Cone";
      lateralSurfaceArea = Math.PI * radius * slantHeight;
      baseSurfaceArea = Math.PI * radius * radius;
      totalSurfaceArea = lateralSurfaceArea + baseSurfaceArea;
      formula = "SA = πrs + πr²";

      steps.push(`Radius (r) = ${radius}, Slant Height (s) = ${slantHeight}`);
      steps.push(`Lateral Surface Area = πrs = ${lateralSurfaceArea.toFixed(6)}`);
      steps.push(`Base Area = πr² = ${baseSurfaceArea.toFixed(6)}`);
      steps.push(`Total Surface Area = πrs + πr²`);
      steps.push(`= ${totalSurfaceArea.toFixed(6)}`);
      break;
    }

    case "pyramid": {
      const { baseLength, baseWidth, slantHeight } = input;
      if (
        !baseLength ||
        !baseWidth ||
        !slantHeight ||
        baseLength <= 0 ||
        baseWidth <= 0 ||
        slantHeight <= 0
      ) {
        return {
          ok: false,
          error: "Base length, base width, and slant height must be positive numbers for pyramid",
          code: "INVALID_INPUT",
        };
      }

      shapeName = "Rectangular Pyramid";
      baseSurfaceArea = baseLength * baseWidth;
      // Lateral area = 2 triangles with base=length + 2 triangles with base=width
      lateralSurfaceArea = baseLength * slantHeight + baseWidth * slantHeight;
      totalSurfaceArea = baseSurfaceArea + lateralSurfaceArea;
      formula = "SA = lw + ls + ws";

      steps.push(`Base: ${baseLength} × ${baseWidth}, Slant Height = ${slantHeight}`);
      steps.push(`Base Area = ${baseSurfaceArea}`);
      steps.push(`Lateral Area = ${baseLength}×${slantHeight} + ${baseWidth}×${slantHeight}`);
      steps.push(`= ${lateralSurfaceArea}`);
      steps.push(`Total = ${totalSurfaceArea}`);
      break;
    }

    case "triangularPrism": {
      const { triangleBase, triangleHeight, prismLength, side1, side2, side3 } = input;
      if (
        !triangleBase ||
        !triangleHeight ||
        !prismLength ||
        triangleBase <= 0 ||
        triangleHeight <= 0 ||
        prismLength <= 0
      ) {
        return {
          ok: false,
          error:
            "Triangle base, triangle height, and prism length must be positive numbers for triangular prism",
          code: "INVALID_INPUT",
        };
      }

      shapeName = "Triangular Prism";
      baseSurfaceArea = 0.5 * triangleBase * triangleHeight;

      // If sides are provided, use them; otherwise estimate
      const s1 = side1 || triangleBase;
      const s2 = side2 || Math.sqrt((triangleBase / 2) ** 2 + triangleHeight ** 2);
      const s3 = side3 || s2;

      lateralSurfaceArea = (s1 + s2 + s3) * prismLength;
      totalSurfaceArea = 2 * baseSurfaceArea + lateralSurfaceArea;
      formula = "SA = bh + (s₁ + s₂ + s₃)L";

      steps.push(`Triangle base = ${triangleBase}, height = ${triangleHeight}`);
      steps.push(`Prism length = ${prismLength}`);
      steps.push(`Base Area = ½ × ${triangleBase} × ${triangleHeight} = ${baseSurfaceArea}`);
      steps.push(`Lateral Area = (${s1} + ${s2.toFixed(2)} + ${s3.toFixed(2)}) × ${prismLength}`);
      steps.push(`= ${lateralSurfaceArea.toFixed(6)}`);
      steps.push(`Total = ${totalSurfaceArea.toFixed(6)}`);
      break;
    }

    case "hemisphere": {
      const { radius } = input;
      if (radius === undefined || radius <= 0) {
        return {
          ok: false,
          error: "Radius must be a positive number for hemisphere",
          code: "INVALID_INPUT",
        };
      }

      shapeName = "Hemisphere";
      lateralSurfaceArea = 2 * Math.PI * radius * radius; // Curved surface
      baseSurfaceArea = Math.PI * radius * radius; // Flat circular base
      totalSurfaceArea = lateralSurfaceArea + baseSurfaceArea;
      formula = "SA = 3πr²";

      steps.push(`Radius (r) = ${radius}`);
      steps.push(`Curved Surface Area = 2πr² = ${lateralSurfaceArea.toFixed(6)}`);
      steps.push(`Base Area = πr² = ${baseSurfaceArea.toFixed(6)}`);
      steps.push(`Total Surface Area = 3πr² = ${totalSurfaceArea.toFixed(6)}`);
      break;
    }

    default:
      return { ok: false, error: "Unknown shape specified", code: "INVALID_INPUT" };
  }

  return {
    ok: true,
    value: {
      shape: shapeName,
      totalSurfaceArea,
      lateralSurfaceArea,
      baseSurfaceArea,
      formula,
      steps,
      unit: "square units",
    },
  };
}
