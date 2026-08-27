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

// ─── Advanced DoF Calculator ──────────────────────────────────────────────────
export const AdvancedDofFormSchema = z.object({
  aperture: posNumStr("Aperture").refine((v) => Number(v) <= 64, {
    message: "Aperture f-stop too large (max f/64)",
  }),
  focalLength: posNumStr("Focal length").refine((v) => Number(v) <= 2000, {
    message: "Focal length exceeds maximum (2000 mm)",
  }),
  distance: posNumStr("Subject distance").refine((v) => Number(v) <= 10000, {
    message: "Distance exceeds maximum (10000 m)",
  }),
  cropFactor: posNumStr("Crop factor").refine((v) => Number(v) <= 10, {
    message: "Crop factor exceeds maximum (10)",
  }),
  coc: posNumStr("Circle of confusion").refine((v) => Number(v) <= 1, {
    message: "Circle of confusion exceeds maximum (1 mm)",
  }),
});

// ─── Aspect Fit Calculator ────────────────────────────────────────────────────
export const AspectFitFormSchema = z.object({
  sourceWidth: posIntStr("Source width"),
  sourceHeight: posIntStr("Source height"),
  targetWidth: posIntStr("Target width"),
  targetHeight: posIntStr("Target height"),
});

// ─── Aspect Ratio Converter ───────────────────────────────────────────────────
export const AspectRatioFormSchema = z.object({
  width: posIntStr("Width"),
  height: posIntStr("Height"),
});

// ─── Circle of Confusion Calculator ──────────────────────────────────────────
export const CircleOfConfusionFormSchema = z.object({
  sensorWidth: posNumStr("Sensor width").refine((v) => Number(v) <= 200, {
    message: "Sensor width exceeds maximum (200 mm)",
  }),
  viewingDistance: posNumStr("Viewing distance").refine((v) => Number(v) <= 1000, {
    message: "Viewing distance exceeds maximum (1000 mm)",
  }),
  printSize: posNumStr("Print size").refine((v) => Number(v) <= 1000, {
    message: "Print size exceeds maximum (1000 mm)",
  }),
  pixelCount: posIntStr("Pixel count"),
});

// ─── Composition Calculator ───────────────────────────────────────────────────
export const CompositionFormSchema = z.object({
  width: posIntStr("Width"),
  height: posIntStr("Height"),
  cropFactor: posNumStr("Crop factor").refine((v) => Number(v) <= 10, {
    message: "Crop factor exceeds maximum (10)",
  }),
});

// ─── Depth of Field Calculator ────────────────────────────────────────────────
export const DepthOfFieldFormSchema = z.object({
  aperture: posNumStr("Aperture").refine((v) => Number(v) <= 64, {
    message: "Aperture f-stop too large (max f/64)",
  }),
  focalLength: posNumStr("Focal length").refine((v) => Number(v) <= 2000, {
    message: "Focal length exceeds maximum (2000 mm)",
  }),
  distance: posNumStr("Subject distance").refine((v) => Number(v) <= 10000, {
    message: "Distance exceeds maximum (10000 m)",
  }),
  cropFactor: posNumStr("Crop factor").refine((v) => Number(v) <= 10, {
    message: "Crop factor exceeds maximum (10)",
  }),
});

// ─── Diffraction Calculator ───────────────────────────────────────────────────
export const DiffractionFormSchema = z.object({
  aperture: posNumStr("Aperture").refine((v) => Number(v) <= 64, {
    message: "Aperture f-stop too large (max f/64)",
  }),
  pixelPitch: posNumStr("Pixel pitch").refine((v) => Number(v) <= 100, {
    message: "Pixel pitch exceeds maximum (100 µm)",
  }),
});

// ─── DoF Table Calculator ─────────────────────────────────────────────────────
export const DofTableFormSchema = z.object({
  focalLength: posNumStr("Focal length").refine((v) => Number(v) <= 2000, {
    message: "Focal length exceeds maximum (2000 mm)",
  }),
  cropFactor: posNumStr("Crop factor").refine((v) => Number(v) <= 10, {
    message: "Crop factor exceeds maximum (10)",
  }),
});

// ─── DPI Calculator ───────────────────────────────────────────────────────────
export const DpiFormSchema = z.object({
  printWidth: posNumStr("Print width").refine((v) => Number(v) <= 2000, {
    message: "Print width exceeds maximum (2000 inches)",
  }),
  printHeight: posNumStr("Print height").refine((v) => Number(v) <= 2000, {
    message: "Print height exceeds maximum (2000 inches)",
  }),
  dpi: posIntStr("DPI").refine((v) => Number(v) <= 10000, {
    message: "DPI exceeds maximum (10000)",
  }),
});

// ─── Focal Equivalent Calculator ─────────────────────────────────────────────
export const FocalEquivalentFormSchema = z.object({
  focalLength: posNumStr("Focal length").refine((v) => Number(v) <= 2000, {
    message: "Focal length exceeds maximum (2000 mm)",
  }),
  cropFactor: posNumStr("Crop factor").refine((v) => Number(v) <= 10, {
    message: "Crop factor exceeds maximum (10)",
  }),
});

// ─── Hyperfocal Calculator ────────────────────────────────────────────────────
export const HyperfocalFormSchema = z.object({
  focalLength: posNumStr("Focal length").refine((v) => Number(v) <= 2000, {
    message: "Focal length exceeds maximum (2000 mm)",
  }),
  aperture: posNumStr("Aperture").refine((v) => Number(v) <= 64, {
    message: "Aperture f-stop too large (max f/64)",
  }),
  coc: posNumStr("Circle of confusion").refine((v) => Number(v) <= 1, {
    message: "Circle of confusion exceeds maximum (1 mm)",
  }),
});

// ─── Image Filesize Calculator ────────────────────────────────────────────────
export const ImageFilesizeFormSchema = z.object({
  width: posIntStr("Width"),
  height: posIntStr("Height"),
  format: z.string().min(1, "Format is required"),
  quality: z.enum(["low", "typical", "high"]),
});

// ─── Light EV Calculator ──────────────────────────────────────────────────────
export const LightEvFormSchema = z.object({
  aperture: posNumStr("Aperture").refine((v) => Number(v) <= 64, {
    message: "Aperture f-stop too large (max f/64)",
  }),
  shutterSpeed: posNumStr("Shutter speed"),
  iso: posIntStr("ISO").refine((v) => Number(v) <= 1638400, {
    message: "ISO exceeds maximum (1638400)",
  }),
});

// ─── Macro DoF Calculator ─────────────────────────────────────────────────────
export const MacroDofFormSchema = z.object({
  aperture: posNumStr("Aperture").refine((v) => Number(v) <= 64, {
    message: "Aperture f-stop too large (max f/64)",
  }),
  focalLength: posNumStr("Focal length").refine((v) => Number(v) <= 2000, {
    message: "Focal length exceeds maximum (2000 mm)",
  }),
  magnification: posNumStr("Magnification"),
});

// ─── Macro Diffraction Calculator ─────────────────────────────────────────────
export const MacroDiffractionFormSchema = z.object({
  aperture: posNumStr("Aperture").refine((v) => Number(v) <= 64, {
    message: "Aperture f-stop too large (max f/64)",
  }),
  magnification: posNumStr("Magnification"),
  pixelPitch: posNumStr("Pixel pitch").refine((v) => Number(v) <= 100, {
    message: "Pixel pitch exceeds maximum (100 µm)",
  }),
});

// ─── Megapixel Calculator ─────────────────────────────────────────────────────
export const MegapixelFormSchema = z.object({
  width: posIntStr("Width"),
  height: posIntStr("Height"),
});

// ─── Megapixel Aspects Calculator ────────────────────────────────────────────
export const MegapixelAspectsFormSchema = z.object({
  megapixels: posNumStr("Megapixels").refine((v) => Number(v) <= 1000, {
    message: "Megapixels exceeds maximum (1000 MP)",
  }),
});

// ─── ND Filter Calculator ─────────────────────────────────────────────────────
export const NdFilterFormSchema = z.object({
  originalShutterSpeed: posNumStr("Original shutter speed"),
  stops: posNumStr("ND stops").refine((v) => Number(v) <= 20, {
    message: "ND stops exceeds maximum (20)",
  }),
});

// ─── Portrait Distance Calculator ────────────────────────────────────────────
export const PortraitDistanceFormSchema = z.object({
  focalLength: posNumStr("Focal length").refine((v) => Number(v) <= 2000, {
    message: "Focal length exceeds maximum (2000 mm)",
  }),
  cropFactor: posNumStr("Crop factor").refine((v) => Number(v) <= 10, {
    message: "Crop factor exceeds maximum (10)",
  }),
});

// ─── Spot Stars Calculator ────────────────────────────────────────────────────
export const SpotStarsFormSchema = z.object({
  focalLength: posNumStr("Focal length").refine((v) => Number(v) <= 2000, {
    message: "Focal length exceeds maximum (2000 mm)",
  }),
  cropFactor: posNumStr("Crop factor").refine((v) => Number(v) <= 10, {
    message: "Crop factor exceeds maximum (10)",
  }),
});

// ─── Star Trails Calculator ───────────────────────────────────────────────────
export const StarTrailsFormSchema = z.object({
  focalLength: posNumStr("Focal length").refine((v) => Number(v) <= 2000, {
    message: "Focal length exceeds maximum (2000 mm)",
  }),
  cropFactor: posNumStr("Crop factor").refine((v) => Number(v) <= 10, {
    message: "Crop factor exceeds maximum (10)",
  }),
  latitude: z
    .string()
    .refine((v) => v !== "" && !Number.isNaN(Number(v)), { message: "Latitude must be a number" })
    .refine((v) => Number(v) >= -90 && Number(v) <= 90, {
      message: "Latitude must be between -90 and 90",
    }),
});

// ─── Time Lapse Calculator ────────────────────────────────────────────────────
export const TimeLapseFormSchema = z.object({
  duration: posNumStr("Duration").refine((v) => Number(v) <= 86400, {
    message: "Duration exceeds maximum (86400 seconds)",
  }),
  intervalSeconds: posNumStr("Interval").refine((v) => Number(v) <= 3600, {
    message: "Interval exceeds maximum (3600 seconds)",
  }),
  frameRate: numStrRange("Frame rate", 1, 120),
});

// ─── Sun Position / Golden Hour Calculator ────────────────────────────────────
export const SunPositionFormSchema = z.object({
  latitude: z
    .string()
    .refine((v) => v !== "" && !Number.isNaN(Number(v)), { message: "Latitude must be a number" })
    .refine((v) => Number(v) >= -90 && Number(v) <= 90, {
      message: "Latitude must be between -90 and 90",
    }),
  longitude: z
    .string()
    .refine((v) => v !== "" && !Number.isNaN(Number(v)), { message: "Longitude must be a number" })
    .refine((v) => Number(v) >= -180 && Number(v) <= 180, {
      message: "Longitude must be between -180 and 180",
    }),
  date: z.string().min(1, "Date is required"),
});
