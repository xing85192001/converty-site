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

// ─── BB Credit Calculator ─────────────────────────────────────────────────────
// Note: Uses useState directly
export const BbCreditFormSchema = z.object({
  speed: posNumStr("Speed").refine((v) => Number(v) <= 100000, {
    message: "Speed exceeds maximum (100000 Gbps)",
  }),
  distance: posNumStr("Distance").refine((v) => Number(v) <= 100000, {
    message: "Distance exceeds maximum (100000 km)",
  }),
});

// ─── CIDR Range Calculator ────────────────────────────────────────────────────
// Note: Uses useState directly
export const CidrRangeFormSchema = z.object({
  cidr: z.string().min(7, "CIDR notation is required (e.g. 192.168.0.0/24)"),
});

// ─── IP Calculator ─────────────────────────────────────────────────────────────
// Note: Uses useState directly
export const IpCalculatorFormSchema = z.object({
  ipAddress: z.string().min(7, "IP address is required").max(45, "IP address is too long"),
  prefix: numStrRange("Prefix length", 0, 128),
});

// ─── Latency Converter ────────────────────────────────────────────────────────
// Note: Uses dedicated useLatencyConverterStore (not createCalculatorStore)
// Schema for reference / future integration
export const LatencyConverterFormSchema = z.object({
  value: posNumStr("Latency value"),
  unit: z.string().min(1, "Unit is required"),
});

// ─── Subnet Calculator ────────────────────────────────────────────────────────
// Note: Complex custom UI — schema for store attachment only, no error wiring
export const SubnetFormSchema = z.object({
  network: z.string().min(7, "Network address is required").max(18, "Network address is too long"),
});

// ─── Throughput Calculator ────────────────────────────────────────────────────
// Note: Uses useState directly
export const ThroughputFormSchema = z.object({
  bandwidth: posNumStr("Bandwidth").refine((v) => Number(v) <= 1000000, {
    message: "Bandwidth exceeds maximum (1000000 Gbps)",
  }),
  efficiency: numStrRange("Efficiency", 0, 100),
});
