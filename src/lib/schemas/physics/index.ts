import { z } from "zod";

// ─── Speed Converter ──────────────────────────────────────────────────────────
// Note: SpeedConverter uses useState directly — schema for reference only
export const SpeedFormSchema = z.object({
  value: z
    .string()
    .refine((v) => v !== "" && !Number.isNaN(Number(v)), {
      message: "Speed value must be a number",
    })
    .refine((v) => Number(v) >= 0, {
      message: "Speed value must be non-negative",
    }),
  unit: z.enum(["ms", "kmh", "mph", "knot", "fts", "mach"]),
});
