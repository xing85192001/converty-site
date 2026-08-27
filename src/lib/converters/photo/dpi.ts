import type { CalculationResult } from "@/types";

export interface DPIResult {
  megapixels: number;
  totalPixels: number;
  pixelWidth: number;
  pixelHeight: number;
  printQuality: string;
  qualityDescription: string;
}

export function calculateDPI(
  printWidth: number, // inches
  printHeight: number, // inches
  dpi: number
): CalculationResult<DPIResult> {
  if (printWidth <= 0 || printHeight <= 0 || dpi <= 0) {
    return { ok: false, error: "Print dimensions and DPI must be positive", code: "INVALID_INPUT" };
  }

  const pixelWidth = Math.round(printWidth * dpi);
  const pixelHeight = Math.round(printHeight * dpi);
  const totalPixels = pixelWidth * pixelHeight;
  const megapixels = totalPixels / 1000000;

  const { printQuality, qualityDescription } = getPrintQuality(dpi);

  return {
    ok: true,
    value: {
      megapixels: Math.round(megapixels * 100) / 100,
      totalPixels,
      pixelWidth,
      pixelHeight,
      printQuality,
      qualityDescription,
    },
  };
}

export function calculatePixelsToDPI(
  pixelWidth: number,
  pixelHeight: number,
  printWidth: number, // inches
  printHeight: number // inches
): CalculationResult<{ horizontalDPI: number; verticalDPI: number; effectiveDPI: number }> {
  if (pixelWidth <= 0 || pixelHeight <= 0 || printWidth <= 0 || printHeight <= 0) {
    return {
      ok: false,
      error: "Pixel dimensions and print dimensions must be positive",
      code: "INVALID_INPUT",
    };
  }

  const horizontalDPI = pixelWidth / printWidth;
  const verticalDPI = pixelHeight / printHeight;
  const effectiveDPI = Math.min(horizontalDPI, verticalDPI);

  return {
    ok: true,
    value: {
      horizontalDPI: Math.round(horizontalDPI),
      verticalDPI: Math.round(verticalDPI),
      effectiveDPI: Math.round(effectiveDPI),
    },
  };
}

function getPrintQuality(dpi: number): { printQuality: string; qualityDescription: string } {
  if (dpi >= 300) {
    return {
      printQuality: "Excellent",
      qualityDescription: "Professional photo quality, suitable for close viewing",
    };
  } else if (dpi >= 200) {
    return {
      printQuality: "Good",
      qualityDescription: "Good quality for standard prints",
    };
  } else if (dpi >= 150) {
    return {
      printQuality: "Acceptable",
      qualityDescription: "Acceptable for viewing at arm's length",
    };
  } else if (dpi >= 100) {
    return {
      printQuality: "Low",
      qualityDescription: "Only suitable for large prints viewed from distance",
    };
  } else {
    return {
      printQuality: "Poor",
      qualityDescription: "Visible pixelation, not recommended",
    };
  }
}

export const COMMON_PRINT_SIZES = [
  { name: '4×6"', width: 4, height: 6 },
  { name: '5×7"', width: 5, height: 7 },
  { name: '8×10"', width: 8, height: 10 },
  { name: '11×14"', width: 11, height: 14 },
  { name: '16×20"', width: 16, height: 20 },
  { name: '20×30"', width: 20, height: 30 },
  { name: "A4", width: 8.27, height: 11.69 },
  { name: "A3", width: 11.69, height: 16.54 },
];

export const COMMON_DPI = [72, 96, 150, 200, 300, 600];
