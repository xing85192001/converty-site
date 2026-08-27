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

/** Validate a string represents a non-negative number */
const nonNegNumStr = (label: string) =>
  z
    .string()
    .refine((v) => v !== "" && !Number.isNaN(Number(v)), {
      message: `${label} must be a number`,
    })
    .refine((v) => Number(v) >= 0, {
      message: `${label} must be non-negative`,
    });

// ─── Exchange Rate Calculator ─────────────────────────────────────────────────
// Note: Uses useState directly
export const ExchangeRateFormSchema = z.object({
  amount: posNumStr("Amount"),
  fromCurrency: z.string().min(1, "From currency is required"),
  toCurrency: z.string().min(1, "To currency is required"),
});

// ─── Hash Calculator ──────────────────────────────────────────────────────────
// Note: Uses useState directly
export const HashFormSchema = z.object({
  input: z.string().min(1, "Input is required"),
  algorithm: z.string().min(1, "Algorithm is required"),
});

// ─── Mining Calculator ────────────────────────────────────────────────────────
// Note: Uses dedicated useMiningCalculatorStore (not createCalculatorStore)
// Schema for reference / future integration
export const MiningFormSchema = z.object({
  hashRate: posNumStr("Hash rate"),
  hashRateUnit: z.string().min(1, "Hash rate unit is required"),
  powerWatts: posNumStr("Power consumption").refine((v) => Number(v) <= 100000, {
    message: "Power consumption exceeds maximum (100000 W)",
  }),
  electricityCost: posNumStr("Electricity cost").refine((v) => Number(v) <= 10, {
    message: "Electricity cost exceeds maximum (10 per kWh)",
  }),
  currency: z.string().min(1, "Currency is required"),
  hardwareCost: nonNegNumStr("Hardware cost"),
});

// ─── Wallet Validator ─────────────────────────────────────────────────────────
// Note: Uses useState directly
export const WalletValidatorFormSchema = z.object({
  address: z.string().min(1, "Wallet address is required"),
  blockchain: z.string().min(1, "Blockchain is required"),
});
