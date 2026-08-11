import { z } from "zod";

// ─── BPM Calculator ───────────────────────────────────────────────────────────
// Note: BPMCalculator uses useState directly — schema for reference only
export const BpmFormSchema = z.object({
  bpm: z
    .string()
    .refine((v) => v !== "" && !Number.isNaN(Number(v)), {
      message: "BPM must be a number",
    })
    .refine((v) => Number(v) > 0, {
      message: "BPM must be positive",
    })
    .refine((v) => Number(v) <= 300, {
      message: "BPM too large (max 300)",
    }),
});
