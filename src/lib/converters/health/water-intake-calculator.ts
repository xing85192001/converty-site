import type { CalculationResult } from "@/types";

export interface WaterIntakeInput {
  weight: number; // kg
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "athlete";
  climate: "temperate" | "hot" | "humid" | "cold";
  pregnant: boolean;
  breastfeeding: boolean;
}

export type WaterTipKey =
  | "morningGlass"
  | "carryBottle"
  | "setReminders"
  | "exerciseDrink"
  | "waterRichFoods"
  | "beforeMeals"
  | "urineColor";

export type ScheduleTimeKey =
  | "time0700"
  | "time0900"
  | "time1100"
  | "time1300"
  | "time1500"
  | "time1700"
  | "time1900"
  | "time2100";

export interface WaterIntakeResult {
  dailyIntakeMl: number;
  dailyIntakeLiters: number;
  dailyIntakeOz: number;
  dailyIntakeCups: number;
  hourlyReminder: number; // ml per hour (16 waking hours)
  breakdown: {
    baseNeeds: number;
    activityAddition: number;
    climateAddition: number;
    specialAddition: number;
  };
  tipKeys: WaterTipKey[];
  schedule: Array<{
    timeKey: ScheduleTimeKey;
    amount: number;
    cumulative: number;
  }>;
}

export function calculateWaterIntake(
  input: WaterIntakeInput
): CalculationResult<WaterIntakeResult> {
  const { weight, activityLevel, climate, pregnant, breastfeeding } = input;

  if (weight <= 0) {
    return { ok: false, error: "Weight must be positive", code: "INVALID_INPUT" };
  }

  // Base water needs: 30-35ml per kg body weight
  const baseNeeds = weight * 33;

  // Activity level adjustment
  const activityAdditions: Record<string, number> = {
    sedentary: 0,
    light: 350,
    moderate: 500,
    active: 750,
    athlete: 1000,
  };
  const activityAddition = activityAdditions[activityLevel];

  // Climate adjustment
  const climateAdditions: Record<string, number> = {
    temperate: 0,
    hot: 500,
    humid: 400,
    cold: 200, // People often forget to drink in cold weather
  };
  const climateAddition = climateAdditions[climate];

  // Special conditions
  let specialAddition = 0;
  if (pregnant) specialAddition += 300;
  if (breastfeeding) specialAddition += 700;

  const dailyIntakeMl = baseNeeds + activityAddition + climateAddition + specialAddition;
  const dailyIntakeLiters = dailyIntakeMl / 1000;
  const dailyIntakeOz = dailyIntakeMl / 29.574;
  const dailyIntakeCups = dailyIntakeMl / 237;

  // Hourly reminder (assuming 16 waking hours)
  const hourlyReminder = Math.round(dailyIntakeMl / 16);

  // Drinking schedule
  const scheduleData: Array<{ timeKey: ScheduleTimeKey; percent: number }> = [
    { timeKey: "time0700", percent: 10 },
    { timeKey: "time0900", percent: 20 },
    { timeKey: "time1100", percent: 30 },
    { timeKey: "time1300", percent: 45 },
    { timeKey: "time1500", percent: 60 },
    { timeKey: "time1700", percent: 75 },
    { timeKey: "time1900", percent: 90 },
    { timeKey: "time2100", percent: 100 },
  ];

  const schedule = scheduleData.map((item, index, arr) => {
    const prevPercent = index > 0 ? arr[index - 1].percent : 0;
    return {
      timeKey: item.timeKey,
      amount: Math.round(((item.percent - prevPercent) / 100) * dailyIntakeMl),
      cumulative: Math.round((item.percent / 100) * dailyIntakeMl),
    };
  });

  const tipKeys: WaterTipKey[] = [
    "morningGlass",
    "carryBottle",
    "setReminders",
    "exerciseDrink",
    "waterRichFoods",
    "beforeMeals",
    "urineColor",
  ];

  return {
    ok: true,
    value: {
      dailyIntakeMl,
      dailyIntakeLiters,
      dailyIntakeOz,
      dailyIntakeCups,
      hourlyReminder,
      breakdown: {
        baseNeeds,
        activityAddition,
        climateAddition,
        specialAddition,
      },
      tipKeys,
      schedule,
    },
  };
}
