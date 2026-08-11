import { z } from "zod";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Validate a string represents a positive number */
const posNumStr = (label: string) =>
  z
    .string()
    .refine((v) => v !== "" && !Number.isNaN(Number(v)), {
      message: `${label} must be a number`,
    })
    .refine((v) => Number(v) > 0, {
      message: `${label} must be positive`,
    });

/** Validate a string represents a positive integer */
const posIntStr = (label: string) =>
  z
    .string()
    .refine((v) => v !== "" && !Number.isNaN(Number(v)), {
      message: `${label} must be a number`,
    })
    .refine((v) => Number.isInteger(Number(v)) && Number(v) > 0, {
      message: `${label} must be a positive whole number`,
    });

/** Validate a string represents a number within a range */
const numStrRange = (label: string, min: number, max: number) =>
  z
    .string()
    .refine((v) => v !== "" && !Number.isNaN(Number(v)), {
      message: `${label} must be a number`,
    })
    .refine(
      (v) => {
        const n = Number(v);
        return n >= min && n <= max;
      },
      {
        message: `${label} must be between ${min} and ${max}`,
      }
    );

// ─── Audio Filesize Calculator ────────────────────────────────────────────────
export const AudioFilesizeFormSchema = z.object({
  duration: posIntStr("Duration").refine((v) => Number(v) <= 86400, {
    message: "Duration exceeds maximum (86400 seconds)",
  }),
  format: z.string().min(1, "Format is required"),
  quality: z.enum(["low", "typical", "high"]),
  channels: z.enum(["1", "2"]),
});

// ─── Common Bitrates Viewer ────────────────────────────────────────────────────
// Note: CommonBitratesViewer is a reference table, no input schema needed
export const CommonBitratesFormSchema = z.object({
  category: z.string().min(1, "Category is required"),
});

// ─── DCP Filesize Calculator ──────────────────────────────────────────────────
export const DcpFilesizeFormSchema = z.object({
  duration: posNumStr("Duration").refine((v) => Number(v) <= 10800, {
    message: "Duration exceeds maximum (10800 minutes)",
  }),
  resolution: z.string().min(1, "Resolution is required"),
  frameRate: numStrRange("Frame rate", 1, 120),
});

// ─── Foot Lambert Calculator ──────────────────────────────────────────────────
export const FootLambertFormSchema = z.object({
  nits: posNumStr("Nits").refine((v) => Number(v) <= 100000, {
    message: "Nits exceeds maximum (100000)",
  }),
});

// ─── Frame Rate Converter ─────────────────────────────────────────────────────
export const FrameRateFormSchema = z.object({
  value: posNumStr("Value"),
  unit: z.string().min(1, "Unit is required"),
});

// ─── Screen Size Calculator ───────────────────────────────────────────────────
export const ScreenSizeFormSchema = z.object({
  diagonal: posNumStr("Diagonal").refine((v) => Number(v) <= 1000, {
    message: "Diagonal exceeds maximum (1000 inches)",
  }),
  aspectWidth: posIntStr("Aspect width"),
  aspectHeight: posIntStr("Aspect height"),
});

// ─── Video Bitrate Calculator ─────────────────────────────────────────────────
export const VideoBitrateFormSchema = z.object({
  resolution: z.string().min(1, "Resolution is required"),
  frameRate: numStrRange("Frame rate", 1, 1000),
  quality: z.string().min(1, "Quality is required"),
});

// ─── Video File Size Calculator ───────────────────────────────────────────────
export const VideoFileSizeFormSchema = z.object({
  bitrate: posNumStr("Bitrate").refine((v) => Number(v) <= 1000000, {
    message: "Bitrate exceeds maximum (1000000 Mbps)",
  }),
  duration: posNumStr("Duration").refine((v) => Number(v) <= 86400, {
    message: "Duration exceeds maximum (86400 seconds)",
  }),
});
