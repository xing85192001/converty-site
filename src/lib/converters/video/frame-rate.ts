import type { CalculationResult } from "@/types";

export interface FrameRateConversionResult {
  sourceRate: number;
  targetRate: number;
  conversionMethod: string;
  speedChange: number; // percentage
  durationChange: number; // percentage
  audioAdjustment: string;
  ffmpegCommand: string;
  soxCommand?: string;
  warnings: string[];
}

export function calculateFrameRateConversion(
  sourceFps: number,
  targetFps: number,
  _duration: number = 60, // seconds
  adjustAudio: boolean = true
): CalculationResult<FrameRateConversionResult> {
  if (sourceFps <= 0 || targetFps <= 0) {
    return {
      ok: false,
      error: "Frame rates must be positive",
      code: "INVALID_INPUT",
    };
  }

  const ratio = targetFps / sourceFps;
  const speedChange = (ratio - 1) * 100;
  const durationChange = (1 / ratio - 1) * 100;
  const warnings: string[] = [];

  let conversionMethod: string;
  let ffmpegCommand: string;
  let soxCommand: string | undefined;
  let audioAdjustment: string;

  // Determine conversion method
  if (Math.abs(ratio - 1) < 0.001) {
    conversionMethod = "None required";
    ffmpegCommand = "# No conversion needed - same frame rate";
    audioAdjustment = "None";
  } else if (ratio === Math.round(ratio) && ratio >= 1) {
    // Simple integer multiplication (e.g., 30 to 60)
    conversionMethod = "Frame duplication";
    ffmpegCommand = `ffmpeg -i input.mp4 -r ${targetFps} -c:v libx264 -c:a copy output.mp4`;
    audioAdjustment = "None (frames duplicated)";
  } else if (1 / ratio === Math.round(1 / ratio) && ratio < 1) {
    // Simple integer division (e.g., 60 to 30)
    conversionMethod = "Frame dropping";
    ffmpegCommand = `ffmpeg -i input.mp4 -r ${targetFps} -c:v libx264 -c:a copy output.mp4`;
    audioAdjustment = "None (frames dropped)";
  } else if (Math.abs(ratio - 1) < 0.05) {
    // Small change - speed adjustment
    conversionMethod = "Speed adjustment";
    ffmpegCommand = `ffmpeg -i input.mp4 -filter:v "setpts=${(1 / ratio).toFixed(6)}*PTS" -filter:a "atempo=${ratio.toFixed(6)}" -r ${targetFps} output.mp4`;
    audioAdjustment = adjustAudio
      ? `Pitch-corrected ${speedChange.toFixed(2)}%`
      : "Speed changed (pitch affected)";

    if (adjustAudio) {
      soxCommand = `sox input.wav output.wav tempo ${ratio.toFixed(4)}`;
    }
  } else {
    // Large change - interpolation recommended
    conversionMethod = "Motion interpolation";
    ffmpegCommand = `ffmpeg -i input.mp4 -filter:v "minterpolate='fps=${targetFps}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1'" -c:a aac output.mp4`;
    audioAdjustment = "Pitch-corrected time stretch";
    warnings.push("Motion interpolation may cause artifacts on fast motion");

    if (adjustAudio) {
      soxCommand = `sox input.wav output.wav tempo ${ratio.toFixed(4)}`;
    }
  }

  // Add warnings for common problematic conversions
  if ((sourceFps === 24 && targetFps === 25) || (sourceFps === 25 && targetFps === 24)) {
    warnings.push("PAL/Film conversion - consider 4% speed change vs interpolation");
  }
  if ((sourceFps === 23.976 || sourceFps === 29.97) && (targetFps === 24 || targetFps === 30)) {
    warnings.push("Drop-frame to non-drop-frame conversion");
  }

  return {
    ok: true,
    value: {
      sourceRate: sourceFps,
      targetRate: targetFps,
      conversionMethod,
      speedChange: Math.round(speedChange * 100) / 100,
      durationChange: Math.round(durationChange * 100) / 100,
      audioAdjustment,
      ffmpegCommand,
      soxCommand,
      warnings,
    },
  };
}

export const COMMON_FRAME_RATES = [
  { fps: 23.976, name: "23.976 (Film NTSC)" },
  { fps: 24, name: "24 (Film)" },
  { fps: 25, name: "25 (PAL)" },
  { fps: 29.97, name: "29.97 (NTSC)" },
  { fps: 30, name: "30" },
  { fps: 48, name: "48 (HFR Film)" },
  { fps: 50, name: "50 (PAL)" },
  { fps: 59.94, name: "59.94 (NTSC)" },
  { fps: 60, name: "60" },
  { fps: 120, name: "120 (HFR)" },
];
