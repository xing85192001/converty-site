import type { CalculationResult } from "@/types";

export interface ScreenSizeResult {
  width: number;
  height: number;
  diagonal: number;
  area: number;
  aspectRatio: string;
  ppi?: number;
}

export function calculateScreenSize(
  diagonal: number,
  aspectRatioW: number,
  aspectRatioH: number,
  _unit: "inches" | "cm" = "inches",
  pixelWidth?: number,
  pixelHeight?: number
): CalculationResult<ScreenSizeResult> {
  if (diagonal <= 0 || aspectRatioW <= 0 || aspectRatioH <= 0) {
    return {
      ok: false,
      error: "Diagonal and aspect ratio dimensions must be positive",
      code: "INVALID_INPUT",
    };
  }

  // Using Pythagorean theorem:
  // diagonal² = width² + height²
  // width/height = aspectRatioW/aspectRatioH
  // Let width = aspectRatioW * k, height = aspectRatioH * k
  // diagonal² = (aspectRatioW * k)² + (aspectRatioH * k)²
  // diagonal² = k² * (aspectRatioW² + aspectRatioH²)
  // k = diagonal / sqrt(aspectRatioW² + aspectRatioH²)

  const k = diagonal / Math.sqrt(aspectRatioW ** 2 + aspectRatioH ** 2);
  const width = aspectRatioW * k;
  const height = aspectRatioH * k;
  const area = width * height;

  // Calculate PPI if pixel dimensions provided
  let ppi: number | undefined;
  if (pixelWidth && pixelHeight) {
    const pixelDiagonal = Math.sqrt(pixelWidth ** 2 + pixelHeight ** 2);
    ppi = pixelDiagonal / diagonal;
  }

  return {
    ok: true,
    value: {
      width: Math.round(width * 100) / 100,
      height: Math.round(height * 100) / 100,
      diagonal: Math.round(diagonal * 100) / 100,
      area: Math.round(area * 100) / 100,
      aspectRatio: `${aspectRatioW}:${aspectRatioH}`,
      ppi: ppi ? Math.round(ppi) : undefined,
    },
  };
}

export const COMMON_ASPECT_RATIOS = [
  { name: "16:9 (Widescreen)", w: 16, h: 9 },
  { name: "21:9 (Ultra-wide)", w: 21, h: 9 },
  { name: "4:3 (Standard)", w: 4, h: 3 },
  { name: "16:10 (MacBook)", w: 16, h: 10 },
  { name: "3:2 (Surface)", w: 3, h: 2 },
  { name: "32:9 (Super ultra-wide)", w: 32, h: 9 },
  { name: "1:1 (Square)", w: 1, h: 1 },
];

export const COMMON_DIAGONALS = [
  { size: 24, typical: "Desktop monitor" },
  { size: 27, typical: "Desktop monitor" },
  { size: 32, typical: "Large monitor" },
  { size: 34, typical: "Ultra-wide monitor" },
  { size: 42, typical: "Small TV" },
  { size: 55, typical: "Medium TV" },
  { size: 65, typical: "Large TV" },
  { size: 75, typical: "Extra large TV" },
  { size: 85, typical: "Premium TV" },
];
