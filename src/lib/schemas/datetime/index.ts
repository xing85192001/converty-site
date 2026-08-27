import { z } from "zod";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Validate a string represents a non-negative integer */
const nonNegIntStr = (label: string) =>
  z
    .string()
    .refine((v) => v !== "" && !Number.isNaN(Number(v)), {
      message: `${label} must be a number`,
    })
    .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0, {
      message: `${label} must be a non-negative whole number`,
    });

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

// ─── Age Calculator ───────────────────────────────────────────────────────────
// Uses createCalculatorStore — schema wired to store
// Date field is empty string initially (valid — calculate returns null for empty)
export const AgeFormSchema = z.object({
  birthDate: z.string(),
});

// ─── Date Calculator ──────────────────────────────────────────────────────────
// Uses createCalculatorStore — schema wired to store
export const DateFormSchema = z.object({
  startDate: z.string(),
  operation: z.enum(["add", "subtract"]),
  years: nonNegIntStr("Years"),
  months: nonNegIntStr("Months"),
  weeks: nonNegIntStr("Weeks"),
  days: nonNegIntStr("Days"),
});

// ─── Day Counter Calculator ───────────────────────────────────────────────────
// Uses createCalculatorStore — schema wired to store
export const DayCounterFormSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  includeEndDate: z.boolean(),
});

// ─── Day of Week Calculator ───────────────────────────────────────────────────
// Uses createCalculatorStore — schema wired to store
export const DayOfWeekFormSchema = z.object({
  date: z.string(),
});

// ─── Duration Converter ───────────────────────────────────────────────────────
// Uses createCalculatorStore — schema wired to store
export const DurationConverterFormSchema = z.object({
  value: posNumStr("Value"),
  unit: z.enum(["seconds", "minutes", "hours", "days", "weeks", "months", "years"]),
});

// ─── Hours Calculator ─────────────────────────────────────────────────────────
// Uses createCalculatorStore — schema wired to store
export const HoursFormSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
  startDate: z.string(),
  endDate: z.string(),
});

// ─── Time Calculator ──────────────────────────────────────────────────────────
// Uses createCalculatorStore — schema wired to store
export const TimeFormSchema = z.object({
  startTime: z.string(),
  operation: z.enum(["add", "subtract"]),
  hours: nonNegIntStr("Hours"),
  minutes: nonNegIntStr("Minutes"),
  seconds: nonNegIntStr("Seconds"),
});

// ─── Time Duration Calculator ─────────────────────────────────────────────────
// Uses createCalculatorStore — schema wired to store
export const TimeDurationFormSchema = z.object({
  startDate: z.string(),
  startTime: z.string(),
  endDate: z.string(),
  endTime: z.string(),
});

// ─── Time Zone Calculator ─────────────────────────────────────────────────────
// Uses createCalculatorStore — schema wired to store
export const TimeZoneFormSchema = z.object({
  dateTime: z.string(),
  fromTimezone: z.string().min(1, "From timezone is required"),
  toTimezone: z.string().min(1, "To timezone is required"),
});
