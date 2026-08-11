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

// ─── Bandwidth Converter ──────────────────────────────────────────────────────
// Note: BandwidthConverter uses useState directly — schema for reference only
export const BandwidthFormSchema = z.object({
  value: posNumStr("Value"),
  unit: z.string().min(1, "Unit is required"),
});

// ─── Bandwidth Delay Product Calculator ───────────────────────────────────────
// Uses createCalculatorStore — schema wired to store
export const BandwidthDelayProductFormSchema = z.object({
  bandwidth: posNumStr("Bandwidth").refine((v) => Number(v) <= 1000000, {
    message: "Bandwidth exceeds maximum (1000000 Mbps)",
  }),
  rtt: posNumStr("RTT").refine((v) => Number(v) <= 100000, {
    message: "RTT exceeds maximum (100000 ms)",
  }),
  windowSize: posNumStr("Window size").refine((v) => Number(v) <= 65535, {
    message: "Window size exceeds maximum (65535 KB)",
  }),
});

// ─── Data Size Converter ──────────────────────────────────────────────────────
// Note: DataSizeConverter uses useState directly — schema for reference only
export const DataSizeFormSchema = z.object({
  value: posNumStr("Value"),
  unit: z.string().min(1, "Unit is required"),
});

// ─── Download Calculator ──────────────────────────────────────────────────────
// Note: DownloadCalculator uses useState directly — schema for reference only
export const DownloadFormSchema = z.object({
  fileSize: posNumStr("File size"),
  fileSizeUnit: z.string().min(1, "File size unit is required"),
  bandwidth: posNumStr("Bandwidth"),
  bandwidthUnit: z.string().min(1, "Bandwidth unit is required"),
});

// ─── TCP Throughput Calculator ────────────────────────────────────────────────
// Uses createCalculatorStore — schema wired to store
export const TcpThroughputFormSchema = z.object({
  mss: posNumStr("MSS").refine((v) => Number(v) <= 65535, {
    message: "MSS exceeds maximum (65535 bytes)",
  }),
  rtt: posNumStr("RTT").refine((v) => Number(v) <= 100000, {
    message: "RTT exceeds maximum (100000 ms)",
  }),
  lossRate: z
    .string()
    .refine((v) => v !== "" && !Number.isNaN(Number(v)), {
      message: "Loss rate must be a number",
    })
    .refine((v) => Number(v) >= 0 && Number(v) <= 1, {
      message: "Loss rate must be between 0 and 1",
    }),
  cFactor: z
    .string()
    .refine((v) => v !== "" && !Number.isNaN(Number(v)), {
      message: "C factor must be a number",
    })
    .refine((v) => Number(v) >= 0.5 && Number(v) <= 2, {
      message: "C factor must be between 0.5 and 2",
    }),
});
