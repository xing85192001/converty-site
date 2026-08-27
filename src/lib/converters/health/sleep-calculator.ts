import type { CalculationResult } from "@/types";

export interface SleepInput {
  mode: "wakeTime" | "bedTime";
  targetTime: string; // HH:MM format
  age: number;
}

export interface SleepResult {
  recommendedHours: { min: number; max: number };
  sleepCycles: number;
  cycleTimes: Array<{
    cycles: number;
    time: string;
    duration: string;
    quality: "optimal" | "good" | "fair";
  }>;
  tips: string[];
  sleepStages: Array<{
    stage: string;
    duration: string;
    description: string;
  }>;
}

export function calculateSleep(input: SleepInput): CalculationResult<SleepResult> {
  const { mode, targetTime, age } = input;

  if (age <= 0 || age > 120) {
    return { ok: false, error: "Age must be between 1 and 120", code: "INVALID_INPUT" };
  }

  // Parse target time
  const [hours, minutes] = targetTime.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return { ok: false, error: "Invalid time format, expected HH:MM", code: "INVALID_INPUT" };
  }

  // Recommended sleep by age
  let recommendedHours: { min: number; max: number };
  if (age < 1) {
    recommendedHours = { min: 14, max: 17 };
  } else if (age < 3) {
    recommendedHours = { min: 11, max: 14 };
  } else if (age < 6) {
    recommendedHours = { min: 10, max: 13 };
  } else if (age < 13) {
    recommendedHours = { min: 9, max: 11 };
  } else if (age < 18) {
    recommendedHours = { min: 8, max: 10 };
  } else if (age < 65) {
    recommendedHours = { min: 7, max: 9 };
  } else {
    recommendedHours = { min: 7, max: 8 };
  }

  // Sleep cycle duration is approximately 90 minutes
  const cycleDuration = 90; // minutes
  const fallAsleepTime = 15; // average time to fall asleep

  // Calculate optimal sleep/wake times based on complete cycles
  const cycleTimes: SleepResult["cycleTimes"] = [];

  for (let cycles = 4; cycles <= 7; cycles++) {
    const totalMinutes = cycles * cycleDuration + fallAsleepTime;
    const totalHours = totalMinutes / 60;

    let resultTime: Date;
    if (mode === "wakeTime") {
      // Calculate bedtime from wake time
      resultTime = new Date();
      resultTime.setHours(hours, minutes, 0, 0);
      resultTime.setMinutes(resultTime.getMinutes() - totalMinutes);
    } else {
      // Calculate wake time from bedtime
      resultTime = new Date();
      resultTime.setHours(hours, minutes, 0, 0);
      resultTime.setMinutes(resultTime.getMinutes() + totalMinutes);
    }

    const timeStr = resultTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const durationHours = Math.floor(totalHours);
    const durationMinutes = Math.round((totalHours - durationHours) * 60);
    const duration = `${durationHours}h ${durationMinutes}m`;

    let quality: "optimal" | "good" | "fair";
    if (cycles === 5 || cycles === 6) {
      quality = "optimal";
    } else if (cycles === 4) {
      quality = "fair";
    } else {
      quality = "good";
    }

    cycleTimes.push({
      cycles,
      time: timeStr,
      duration,
      quality,
    });
  }

  // Sleep stages in a typical cycle (use translation keys)
  const sleepStages = [
    {
      stage: "sleep_stage_1_name",
      duration: "sleep_stage_1_duration",
      description: "sleep_stage_1_desc",
    },
    {
      stage: "sleep_stage_2_name",
      duration: "sleep_stage_2_duration",
      description: "sleep_stage_2_desc",
    },
    {
      stage: "sleep_stage_3_name",
      duration: "sleep_stage_3_duration",
      description: "sleep_stage_3_desc",
    },
    {
      stage: "sleep_stage_rem_name",
      duration: "sleep_stage_rem_duration",
      description: "sleep_stage_rem_desc",
    },
  ];

  // Sleep tips (use translation keys)
  const tips = [
    "sleep_tip_schedule",
    "sleep_tip_routine",
    "sleep_tip_environment",
    "sleep_tip_screens",
    "sleep_tip_caffeine",
    "sleep_tip_exercise",
    "sleep_tip_meals",
    "sleep_tip_cycles",
  ];

  return {
    ok: true,
    value: {
      recommendedHours,
      sleepCycles: 5, // Optimal for most adults
      cycleTimes,
      tips,
      sleepStages,
    },
  };
}
