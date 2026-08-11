import { z } from "zod";

// Helper: validate a string represents a number in a range
const numStr = (label: string) =>
  z
    .string()
    .refine((v) => v !== "" && !Number.isNaN(Number(v)), {
      message: `${label} must be a number`,
    })
    .refine((v) => Number(v) > 0, {
      message: `${label} must be positive`,
    });

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

// ─── Army Body Fat ───────────────────────────────────────────────────────────
export const ArmyBodyFatFormSchema = z.object({
  gender: z.enum(["male", "female"]),
  age: numStrRange("Age", 17, 60),
  height: numStr("Height").refine((v) => Number(v) <= 250, {
    message: "Height exceeds maximum (250 cm)",
  }),
  neck: numStr("Neck circumference").refine((v) => Number(v) <= 100, {
    message: "Neck circumference exceeds maximum (100 cm)",
  }),
  waist: numStr("Waist circumference").refine((v) => Number(v) <= 250, {
    message: "Waist circumference exceeds maximum (250 cm)",
  }),
  hip: numStr("Hip circumference").refine((v) => Number(v) <= 250, {
    message: "Hip circumference exceeds maximum (250 cm)",
  }),
});

// ─── BMI ─────────────────────────────────────────────────────────────────────
export const BmiFormSchema = z.object({
  weight: numStr("Weight").refine((v) => Number(v) <= 1000, {
    message: "Weight exceeds maximum (1000 kg)",
  }),
  weightUnit: z.enum(["kg", "lb"]),
  height: numStr("Height").refine((v) => Number(v) <= 300, {
    message: "Height exceeds maximum (300 cm)",
  }),
  heightUnit: z.enum(["cm", "m", "in", "ft"]),
});

// ─── BMR ─────────────────────────────────────────────────────────────────────
export const BmrFormSchema = z.object({
  gender: z.enum(["male", "female"]),
  age: numStr("Age").refine((v) => Number(v) <= 130, {
    message: "Age exceeds maximum (130)",
  }),
  weight: numStr("Weight").refine((v) => Number(v) <= 1000, {
    message: "Weight exceeds maximum (1000 kg)",
  }),
  height: numStr("Height").refine((v) => Number(v) <= 300, {
    message: "Height exceeds maximum (300 cm)",
  }),
});

// ─── Body Fat ─────────────────────────────────────────────────────────────────
export const BodyFatFormSchema = z.object({
  gender: z.enum(["male", "female"]),
  age: numStr("Age").refine((v) => Number(v) <= 130, {
    message: "Age exceeds maximum (130)",
  }),
  weight: numStr("Weight").refine((v) => Number(v) <= 1000, {
    message: "Weight exceeds maximum (1000 kg)",
  }),
  height: numStr("Height").refine((v) => Number(v) <= 300, {
    message: "Height exceeds maximum (300 cm)",
  }),
  neck: numStr("Neck circumference").refine((v) => Number(v) <= 100, {
    message: "Neck circumference exceeds maximum (100 cm)",
  }),
  waist: numStr("Waist circumference").refine((v) => Number(v) <= 250, {
    message: "Waist circumference exceeds maximum (250 cm)",
  }),
  hip: numStr("Hip circumference").refine((v) => Number(v) <= 250, {
    message: "Hip circumference exceeds maximum (250 cm)",
  }),
});

// ─── Body Surface Area ───────────────────────────────────────────────────────
export const BodySurfaceAreaFormSchema = z.object({
  weight: numStr("Weight").refine((v) => Number(v) <= 1000, {
    message: "Weight exceeds maximum (1000 kg)",
  }),
  height: numStr("Height").refine((v) => Number(v) <= 300, {
    message: "Height exceeds maximum (300 cm)",
  }),
});

// ─── Body Type ───────────────────────────────────────────────────────────────
export const BodyTypeFormSchema = z.object({
  gender: z.enum(["male", "female"]),
  wristCircumference: numStr("Wrist circumference").refine((v) => Number(v) <= 50, {
    message: "Wrist circumference exceeds maximum (50 cm)",
  }),
  height: numStr("Height").refine((v) => Number(v) <= 300, {
    message: "Height exceeds maximum (300 cm)",
  }),
  shoulderWidth: numStr("Shoulder width").refine((v) => Number(v) <= 100, {
    message: "Shoulder width exceeds maximum (100 cm)",
  }),
  hipWidth: numStr("Hip width").refine((v) => Number(v) <= 100, {
    message: "Hip width exceeds maximum (100 cm)",
  }),
});

// ─── Calorie Calculator ───────────────────────────────────────────────────────
export const CalorieFormSchema = z.object({
  gender: z.enum(["male", "female"]),
  age: numStr("Age").refine((v) => Number(v) <= 130, {
    message: "Age exceeds maximum (130)",
  }),
  weight: numStr("Weight").refine((v) => Number(v) <= 1000, {
    message: "Weight exceeds maximum (1000 kg)",
  }),
  height: numStr("Height").refine((v) => Number(v) <= 300, {
    message: "Height exceeds maximum (300 cm)",
  }),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "veryActive"]),
  targetWeight: numStr("Target weight").refine((v) => Number(v) <= 1000, {
    message: "Target weight exceeds maximum (1000 kg)",
  }),
  weeksToGoal: numStr("Weeks to goal").refine((v) => Number(v) <= 520, {
    message: "Weeks to goal exceeds maximum (520 weeks)",
  }),
});

// ─── Calories Burned ─────────────────────────────────────────────────────────
export const CaloriesBurnedFormSchema = z.object({
  weight: numStr("Weight").refine((v) => Number(v) <= 1000, {
    message: "Weight exceeds maximum (1000 kg)",
  }),
  activity: z.string().min(1, "Activity must be selected"),
  duration: numStr("Duration").refine((v) => Number(v) <= 1440, {
    message: "Duration exceeds maximum (1440 minutes)",
  }),
});

// ─── Carb Calculator ─────────────────────────────────────────────────────────
export const CarbFormSchema = z.object({
  calories: numStr("Calories").refine((v) => Number(v) <= 10000, {
    message: "Calories exceed maximum (10000 kcal)",
  }),
  goal: z.enum(["weightLoss", "maintenance", "muscleGain", "keto", "lowCarb", "athlete"]),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "athlete"]),
});

// ─── Corpulence ──────────────────────────────────────────────────────────────
// Note: CorpulenceCalculator uses useState directly (not createCalculatorStore)
// Schema included for completeness but not wired to a store
export const CorpulenceFormSchema = z.object({
  weight: numStr("Weight").refine((v) => Number(v) <= 1000, {
    message: "Weight exceeds maximum (1000 kg)",
  }),
  height: numStr("Height").refine((v) => Number(v) <= 300, {
    message: "Height exceeds maximum (300 cm)",
  }),
});

// ─── Due Date Calculator ──────────────────────────────────────────────────────
export const DueDateFormSchema = z.object({
  calculationMethod: z.enum(["lmp", "conception", "ultrasound", "ivf"]),
  date: z.string().min(1, "Date is required"),
  cycleLength: numStrRange("Cycle length", 21, 40),
  ultrasoundWeeks: numStrRange("Ultrasound weeks", 0, 42),
  ultrasoundDays: numStrRange("Ultrasound days", 0, 6),
});

// ─── Fat Intake Calculator ────────────────────────────────────────────────────
export const FatIntakeFormSchema = z.object({
  calories: numStr("Calories").refine((v) => Number(v) <= 10000, {
    message: "Calories exceed maximum (10000 kcal)",
  }),
  goal: z.enum(["weightLoss", "maintenance", "muscleGain", "keto", "lowFat"]),
});

// ─── GFR Calculator ───────────────────────────────────────────────────────────
export const GfrFormSchema = z.object({
  creatinine: numStr("Creatinine").refine((v) => Number(v) <= 50, {
    message: "Creatinine exceeds maximum (50 mg/dL)",
  }),
  creatinineUnit: z.enum(["mgdl", "umol"]),
  age: numStrRange("Age", 18, 130),
  gender: z.enum(["male", "female"]),
  race: z.enum(["black", "other"]),
  weight: numStr("Weight").refine((v) => Number(v) <= 1000, {
    message: "Weight exceeds maximum (1000 kg)",
  }),
});

// ─── Healthy Weight Calculator ────────────────────────────────────────────────
export const HealthyWeightFormSchema = z.object({
  height: numStr("Height").refine((v) => Number(v) <= 300, {
    message: "Height exceeds maximum (300 cm)",
  }),
  age: numStrRange("Age", 1, 130),
  gender: z.enum(["male", "female"]),
  frameSize: z.enum(["small", "medium", "large"]),
});

// ─── Ideal Weight Calculator ──────────────────────────────────────────────────
export const IdealWeightFormSchema = z.object({
  gender: z.enum(["male", "female"]),
  height: numStr("Height").refine((v) => Number(v) <= 300, {
    message: "Height exceeds maximum (300 cm)",
  }),
  frameSize: z.enum(["small", "medium", "large"]),
});

// ─── Lean Body Mass Calculator ────────────────────────────────────────────────
export const LeanBodyMassFormSchema = z.object({
  gender: z.enum(["male", "female"]),
  weight: numStr("Weight").refine((v) => Number(v) <= 1000, {
    message: "Weight exceeds maximum (1000 kg)",
  }),
  height: numStr("Height").refine((v) => Number(v) <= 300, {
    message: "Height exceeds maximum (300 cm)",
  }),
});

// ─── Macro Calculator ─────────────────────────────────────────────────────────
export const MacroFormSchema = z.object({
  calories: numStr("Calories").refine((v) => Number(v) <= 10000, {
    message: "Calories exceed maximum (10000 kcal)",
  }),
  goal: z.enum(["maintenance", "cutting", "bulking", "keto", "highProtein"]),
});

// ─── One Rep Max Calculator ───────────────────────────────────────────────────
export const OneRepMaxFormSchema = z.object({
  weight: numStr("Weight").refine((v) => Number(v) <= 1000, {
    message: "Weight exceeds maximum (1000 kg)",
  }),
  reps: numStrRange("Reps", 1, 30),
});

// ─── Ovulation Calculator ─────────────────────────────────────────────────────
export const OvulationFormSchema = z.object({
  lastPeriodDate: z.string().min(1, "Last period date is required"),
  cycleLength: numStrRange("Cycle length", 21, 40),
});

// ─── Pace Calculator ──────────────────────────────────────────────────────────
export const PaceFormSchema = z.object({
  mode: z.enum(["pace", "time", "distance"]),
  distance: numStr("Distance").refine((v) => Number(v) <= 10000, {
    message: "Distance exceeds maximum (10000 km)",
  }),
  hours: numStrRange("Hours", 0, 999),
  minutes: numStrRange("Minutes", 0, 59),
  seconds: numStrRange("Seconds", 0, 59),
  paceMinutes: numStrRange("Pace minutes", 0, 59),
  paceSeconds: numStrRange("Pace seconds", 0, 59),
});

// ─── Period Calculator ────────────────────────────────────────────────────────
export const PeriodFormSchema = z.object({
  lastPeriodDate: z.string().min(1, "Last period date is required"),
  cycleLength: numStrRange("Cycle length", 21, 40),
  periodLength: numStrRange("Period length", 2, 10),
});

// ─── Pregnancy Weight Gain Calculator ────────────────────────────────────────
export const PregnancyWeightGainFormSchema = z.object({
  prePregnancyWeight: numStr("Pre-pregnancy weight").refine((v) => Number(v) <= 500, {
    message: "Pre-pregnancy weight exceeds maximum (500 kg)",
  }),
  currentWeight: numStr("Current weight").refine((v) => Number(v) <= 500, {
    message: "Current weight exceeds maximum (500 kg)",
  }),
  height: numStr("Height").refine((v) => Number(v) <= 300, {
    message: "Height exceeds maximum (300 cm)",
  }),
  weeksPregnant: numStrRange("Weeks pregnant", 0, 42),
  twins: z.boolean(),
});

// ─── Protein Calculator ───────────────────────────────────────────────────────
export const ProteinFormSchema = z.object({
  weight: numStr("Weight").refine((v) => Number(v) <= 1000, {
    message: "Weight exceeds maximum (1000 kg)",
  }),
  goal: z.enum(["sedentary", "maintenance", "muscleGain", "fatLoss", "athlete", "endurance"]),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "veryActive"]),
});

// ─── Sleep Calculator ─────────────────────────────────────────────────────────
export const SleepFormSchema = z.object({
  mode: z.enum(["wakeTime", "bedTime"]),
  targetTime: z.string().min(1, "Target time is required"),
  age: numStrRange("Age", 1, 130),
});

// ─── Target Heart Rate Calculator ─────────────────────────────────────────────
export const TargetHeartRateFormSchema = z.object({
  age: numStr("Age").refine((v) => Number(v) <= 130, {
    message: "Age exceeds maximum (130)",
  }),
  restingHeartRate: numStrRange("Resting heart rate", 30, 200),
});

// ─── TDEE Calculator ──────────────────────────────────────────────────────────
export const TdeeFormSchema = z.object({
  gender: z.enum(["male", "female"]),
  age: numStr("Age").refine((v) => Number(v) <= 130, {
    message: "Age exceeds maximum (130)",
  }),
  weight: numStr("Weight").refine((v) => Number(v) <= 1000, {
    message: "Weight exceeds maximum (1000 kg)",
  }),
  height: numStr("Height").refine((v) => Number(v) <= 300, {
    message: "Height exceeds maximum (300 cm)",
  }),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "veryActive"]),
  goal: z.enum(["lose", "maintain", "gain"]),
});

// ─── Water Intake Calculator ──────────────────────────────────────────────────
export const WaterIntakeFormSchema = z.object({
  weight: numStr("Weight").refine((v) => Number(v) <= 1000, {
    message: "Weight exceeds maximum (1000 kg)",
  }),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "athlete"]),
  climate: z.enum(["temperate", "hot", "humid", "cold"]),
  pregnant: z.boolean(),
  breastfeeding: z.boolean(),
});
