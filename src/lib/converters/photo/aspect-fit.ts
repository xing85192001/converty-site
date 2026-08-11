import type { CalculationResult } from "@/types";

export interface AspectFitResult {
  fittedWidth: number;
  fittedHeight: number;
  scale: number;
  letterboxing: "horizontal" | "vertical" | "none";
  letterboxSize: number;
  fillPercentage: number;
}

export function calculateAspectFit(
  imageWidth: number,
  imageHeight: number,
  screenWidth: number,
  screenHeight: number
): CalculationResult<AspectFitResult> {
  if (imageWidth <= 0 || imageHeight <= 0 || screenWidth <= 0 || screenHeight <= 0) {
    return {
      ok: false,
      error: "Image and screen dimensions must be positive",
      code: "INVALID_INPUT",
    };
  }

  const imageRatio = imageWidth / imageHeight;
  const screenRatio = screenWidth / screenHeight;

  let fittedWidth: number;
  let fittedHeight: number;
  let letterboxing: "horizontal" | "vertical" | "none";
  let letterboxSize: number;

  if (Math.abs(imageRatio - screenRatio) < 0.001) {
    // Perfect fit
    fittedWidth = screenWidth;
    fittedHeight = screenHeight;
    letterboxing = "none";
    letterboxSize = 0;
  } else if (imageRatio > screenRatio) {
    // Image is wider - fit to width, letterbox top/bottom
    fittedWidth = screenWidth;
    fittedHeight = screenWidth / imageRatio;
    letterboxing = "horizontal";
    letterboxSize = (screenHeight - fittedHeight) / 2;
  } else {
    // Image is taller - fit to height, letterbox left/right
    fittedHeight = screenHeight;
    fittedWidth = screenHeight * imageRatio;
    letterboxing = "vertical";
    letterboxSize = (screenWidth - fittedWidth) / 2;
  }

  const scale = fittedWidth / imageWidth;
  const fillPercentage = ((fittedWidth * fittedHeight) / (screenWidth * screenHeight)) * 100;

  return {
    ok: true,
    value: {
      fittedWidth: Math.round(fittedWidth),
      fittedHeight: Math.round(fittedHeight),
      scale: Math.round(scale * 1000) / 1000,
      letterboxing,
      letterboxSize: Math.round(letterboxSize),
      fillPercentage: Math.round(fillPercentage * 10) / 10,
    },
  };
}

export const COMMON_SCREENS = [
  { name: "HD (720p)", width: 1280, height: 720 },
  { name: "Full HD (1080p)", width: 1920, height: 1080 },
  { name: "QHD (1440p)", width: 2560, height: 1440 },
  { name: "4K UHD", width: 3840, height: 2160 },
  { name: "iPhone 15 Pro", width: 1179, height: 2556 },
  { name: 'iPad Pro 12.9"', width: 2048, height: 2732 },
];
