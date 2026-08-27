import { z } from "zod";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Validate a string represents an integer within a range */
const intStrRange = (label: string, min: number, max: number) =>
  z
    .string()
    .refine((v) => v !== "" && !Number.isNaN(Number(v)), {
      message: `${label} must be a number`,
    })
    .refine((v) => Number.isInteger(Number(v)) && Number(v) >= min && Number(v) <= max, {
      message: `${label} must be between ${min} and ${max}`,
    });

// ─── RGB Converter ────────────────────────────────────────────────────────────
// Note: RgbConverter uses useState directly — schema for reference only
export const RgbFormSchema = z.object({
  inputMode: z.enum(["rgb", "hex", "hsl", "cmyk"]),
  r: intStrRange("Red channel", 0, 255).describe("Color value must be 0–255"),
  g: intStrRange("Green channel", 0, 255).describe("Color value must be 0–255"),
  b: intStrRange("Blue channel", 0, 255).describe("Color value must be 0–255"),
  hex: z
    .string()
    .regex(/^#?[0-9a-fA-F]{6}$/, "Invalid hex color")
    .optional(),
  h: intStrRange("Hue", 0, 360),
  s: intStrRange("Saturation", 0, 100),
  l: intStrRange("Lightness", 0, 100),
  c: intStrRange("Cyan", 0, 100),
  m: intStrRange("Magenta", 0, 100),
  y: intStrRange("Yellow", 0, 100),
  k: intStrRange("Key (Black)", 0, 100),
});
