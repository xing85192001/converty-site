import type { CalculationResult } from "@/types";

export interface AspectRatioResult {
  width: number;
  height: number;
  ratio: string;
  decimal: number;
  gcd: number;
  isPortrait: boolean;
  isLandscape: boolean;
  isSquare: boolean;
}

function calculateGCD(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

export function calculateAspectRatio(
  width: number,
  height: number
): CalculationResult<AspectRatioResult> {
  if (width <= 0 || height <= 0) {
    return {
      ok: false,
      error: "Width and height must be positive",
      code: "INVALID_INPUT",
    };
  }

  const gcd = calculateGCD(width, height);
  const ratioWidth = Math.round(width / gcd);
  const ratioHeight = Math.round(height / gcd);
  const decimal = width / height;

  return {
    ok: true,
    value: {
      width,
      height,
      ratio: `${ratioWidth}:${ratioHeight}`,
      decimal: Math.round(decimal * 1000) / 1000,
      gcd,
      isPortrait: height > width,
      isLandscape: width > height,
      isSquare: width === height,
    },
  };
}

export interface DimensionFromRatio {
  width: number;
  height: number;
}

export function calculateDimensionFromRatio(
  ratioWidth: number,
  ratioHeight: number,
  targetWidth?: number,
  targetHeight?: number
): CalculationResult<DimensionFromRatio> {
  if (ratioWidth <= 0 || ratioHeight <= 0) {
    return {
      ok: false,
      error: "Ratio dimensions must be positive",
      code: "INVALID_INPUT",
    };
  }

  if (targetWidth && targetWidth > 0) {
    return {
      ok: true,
      value: {
        width: targetWidth,
        height: Math.round((targetWidth * ratioHeight) / ratioWidth),
      },
    };
  }

  if (targetHeight && targetHeight > 0) {
    return {
      ok: true,
      value: {
        width: Math.round((targetHeight * ratioWidth) / ratioHeight),
        height: targetHeight,
      },
    };
  }

  return {
    ok: false,
    error: "Target width or height must be provided",
    code: "INVALID_INPUT",
  };
}

// Common aspect ratios for reference
export const COMMON_RATIOS = [
  { name: "Square", ratio: "1:1", decimal: 1 },
  { name: "Standard TV", ratio: "4:3", decimal: 1.333 },
  { name: "HD Video", ratio: "16:9", decimal: 1.778 },
  { name: "Ultrawide", ratio: "21:9", decimal: 2.333 },
  { name: "Classic Film", ratio: "3:2", decimal: 1.5 },
  { name: "Instagram Portrait", ratio: "4:5", decimal: 0.8 },
  { name: "Cinema", ratio: "2.39:1", decimal: 2.39 },
  { name: "A4 Paper", ratio: "1:1.414", decimal: Math.SQRT1_2 },
];
