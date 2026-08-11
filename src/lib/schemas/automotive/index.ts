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

// ─── Fuel Efficiency Calculator ───────────────────────────────────────────────
// Note: Uses dedicated useFuelEfficiencyStore (not createCalculatorStore)
// Schema for reference / future integration
export const FuelEfficiencyFormSchema = z.object({
  mode: z.enum(["consumption", "tripPlanning", "comparison"]),
  distanceKm: posNumStr("Distance"),
  fuelLiters: posNumStr("Fuel used"),
  tripDistanceKm: posNumStr("Trip distance"),
  consumptionLPer100km: posNumStr("Consumption"),
  vehicle1LPer100km: posNumStr("Vehicle 1 consumption"),
  vehicle2LPer100km: posNumStr("Vehicle 2 consumption"),
  fuelPricePerLiter: posNumStr("Fuel price"),
  currency: z.enum(["CHF", "EUR"]),
  annualDistanceKm: posNumStr("Annual distance"),
});

// ─── Maintenance Intervals Calculator ────────────────────────────────────────
// Note: Uses useState directly
export const MaintenanceIntervalsFormSchema = z.object({
  currentMileage: posIntStr("Current mileage"),
  lastOilChangeMileage: posIntStr("Last oil change mileage"),
  lastTireRotationMileage: posIntStr("Last tire rotation mileage"),
  lastBrakeInspectionMileage: posIntStr("Last brake inspection mileage"),
});

// ─── Tire Sizing Calculator ────────────────────────────────────────────────────
// Note: Uses useState directly
export const TireSizingFormSchema = z.object({
  width: numStrRange("Tire width", 100, 500),
  aspectRatio: numStrRange("Aspect ratio", 20, 100),
  rimDiameter: numStrRange("Rim diameter", 10, 30),
});

// ─── Vehicle Financing Calculator ────────────────────────────────────────────
// Note: Uses dedicated useVehicleFinancingStore (not createCalculatorStore)
// Schema for reference / future integration
export const VehicleFinancingFormSchema = z.object({
  mode: z.enum(["loan", "lease", "compare"]),
  vehiclePrice: posNumStr("Vehicle price"),
  downPayment: z
    .string()
    .refine((v) => v !== "" && !Number.isNaN(Number(v)), {
      message: "Down payment must be a number",
    })
    .refine((v) => Number(v) >= 0, {
      message: "Down payment must be non-negative",
    }),
  tradeInValue: z
    .string()
    .refine((v) => v !== "" && !Number.isNaN(Number(v)), {
      message: "Trade-in value must be a number",
    })
    .refine((v) => Number(v) >= 0, {
      message: "Trade-in value must be non-negative",
    }),
  currency: z.enum(["CHF", "EUR"]),
  includeVAT: z.boolean(),
  loanInterestRate: numStrRange("Loan interest rate", 0, 20),
  loanTermMonths: posIntStr("Loan term"),
  leaseTermMonths: posIntStr("Lease term"),
  residualPercent: numStrRange("Residual percent", 20, 70),
  leaseAPR: numStrRange("Lease APR", 0, 20),
  annualKmLimit: posIntStr("Annual km limit"),
});
