import type { CalculationResult } from "@/types";

export interface CaloriesBurnedInput {
  weight: number; // kg
  activity: string;
  duration: number; // minutes
}

// MET (Metabolic Equivalent of Task) values for various activities
const activityMets: Record<string, { name: string; met: number }> = {
  walking_slow: { name: "walking_slow", met: 2.0 },
  walking_moderate: { name: "walking_moderate", met: 3.5 },
  walking_fast: { name: "walking_fast", met: 5.0 },
  running_5mph: { name: "running_5mph", met: 8.3 },
  running_6mph: { name: "running_6mph", met: 9.8 },
  running_7mph: { name: "running_7mph", met: 11.0 },
  running_8mph: { name: "running_8mph", met: 11.8 },
  cycling_slow: { name: "cycling_slow", met: 4.0 },
  cycling_moderate: { name: "cycling_moderate", met: 8.0 },
  cycling_fast: { name: "cycling_fast", met: 12.0 },
  swimming_slow: { name: "swimming_slow", met: 5.8 },
  swimming_moderate: { name: "swimming_moderate", met: 7.0 },
  swimming_vigorous: { name: "swimming_vigorous", met: 10.0 },
  weightlifting_light: { name: "weightlifting_light", met: 3.0 },
  weightlifting_vigorous: { name: "weightlifting_vigorous", met: 6.0 },
  yoga: { name: "yoga", met: 2.5 },
  pilates: { name: "pilates", met: 3.0 },
  aerobics_low: { name: "aerobics_low", met: 5.0 },
  aerobics_high: { name: "aerobics_high", met: 7.3 },
  dancing: { name: "dancing", met: 5.5 },
  hiking: { name: "hiking", met: 6.0 },
  tennis: { name: "tennis", met: 7.3 },
  basketball: { name: "basketball", met: 6.5 },
  soccer: { name: "soccer", met: 7.0 },
  rowing: { name: "rowing", met: 7.0 },
  elliptical: { name: "elliptical", met: 5.0 },
  stair_climbing: { name: "stair_climbing", met: 8.0 },
  jump_rope: { name: "jump_rope", met: 12.3 },
  housework: { name: "housework", met: 3.5 },
  gardening: { name: "gardening", met: 4.0 },
};

export interface CaloriesBurnedResult {
  caloriesBurned: number;
  caloriesPerMinute: number;
  activityName: string;
  met: number;
  equivalentWalking: number; // minutes of walking to burn same calories
  fatBurned: number; // grams
}

export function calculateCaloriesBurned(
  input: CaloriesBurnedInput
): CalculationResult<CaloriesBurnedResult> {
  const { weight, activity, duration } = input;

  if (weight <= 0 || duration <= 0) {
    return { ok: false, error: "Weight and duration must be positive", code: "INVALID_INPUT" };
  }

  const activityData = activityMets[activity];
  if (!activityData) {
    return { ok: false, error: "Unknown activity specified", code: "INVALID_INPUT" };
  }

  // Calories burned = MET × weight (kg) × duration (hours)
  const durationHours = duration / 60;
  const caloriesBurned = activityData.met * weight * durationHours;
  const caloriesPerMinute = caloriesBurned / duration;

  // Calculate equivalent walking time (at 3.5 MET)
  const equivalentWalking = (caloriesBurned / (3.5 * weight)) * 60;

  // Fat burned (approximately 7700 calories per kg of fat)
  const fatBurned = (caloriesBurned / 7700) * 1000; // grams

  return {
    ok: true,
    value: {
      caloriesBurned,
      caloriesPerMinute,
      activityName: activityData.name,
      met: activityData.met,
      equivalentWalking,
      fatBurned,
    },
  };
}

export function getAvailableActivities(): Array<{ id: string; name: string; met: number }> {
  return Object.entries(activityMets).map(([id, data]) => ({
    id,
    name: data.name,
    met: data.met,
  }));
}
