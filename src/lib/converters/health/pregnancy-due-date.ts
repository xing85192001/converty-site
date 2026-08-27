import type { CalculationResult } from "@/types";

export interface DueDateInput {
  calculationMethod: "lmp" | "conception" | "ultrasound" | "ivf";
  date: string; // ISO date string
  cycleLength?: number; // days, for LMP method
  ultrasoundWeeks?: number;
  ultrasoundDays?: number;
}

export interface DueDateResult {
  dueDate: string;
  conceptionDate: string;
  currentWeeks: number;
  currentDays: number;
  totalDays: number;
  daysRemaining: number;
  trimester: 1 | 2 | 3;
  trimesterProgress: number;
  milestones: Array<{
    week: number;
    name: string;
    date: string;
    passed: boolean;
  }>;
}

export function calculateDueDate(input: DueDateInput): CalculationResult<DueDateResult> {
  const {
    calculationMethod,
    date,
    cycleLength = 28,
    ultrasoundWeeks = 0,
    ultrasoundDays = 0,
  } = input;

  const inputDate = new Date(date);
  if (Number.isNaN(inputDate.getTime())) {
    return { ok: false, error: "Invalid date provided", code: "INVALID_INPUT" };
  }

  // Use UTC midnight to avoid timezone-dependent date arithmetic
  const inputMs = Date.UTC(
    inputDate.getUTCFullYear(),
    inputDate.getUTCMonth(),
    inputDate.getUTCDate()
  );
  const MS_PER_DAY = 86_400_000;
  const addDays = (ms: number, days: number) => new Date(ms + days * MS_PER_DAY);

  const todayMs = Date.UTC(
    new Date().getUTCFullYear(),
    new Date().getUTCMonth(),
    new Date().getUTCDate()
  );

  let conceptionDate: Date;
  let dueDate: Date;

  switch (calculationMethod) {
    case "lmp": {
      // Naegele's rule: LMP + 280 days (adjusted for cycle length)
      const cycleAdjustment = cycleLength - 28;
      conceptionDate = addDays(inputMs, 14 + cycleAdjustment);
      dueDate = addDays(inputMs, 280 + cycleAdjustment);
      break;
    }
    case "conception": {
      conceptionDate = new Date(inputMs);
      dueDate = addDays(inputMs, 266); // 38 weeks from conception
      break;
    }
    case "ultrasound": {
      // Calculate backwards from ultrasound gestational age
      const gestationalDays = ultrasoundWeeks * 7 + ultrasoundDays;
      conceptionDate = addDays(inputMs, -gestationalDays + 14);
      dueDate = addDays(inputMs, 280 - gestationalDays);
      break;
    }
    case "ivf": {
      // IVF transfer date + 266 days (for day 0 embryo) or adjusted
      conceptionDate = new Date(inputMs);
      dueDate = addDays(inputMs, 266);
      break;
    }
    default:
      return { ok: false, error: "Invalid calculation method", code: "INVALID_INPUT" };
  }

  // Calculate current gestational age (UTC-consistent)
  const lmpMs = conceptionDate.getTime() - 14 * MS_PER_DAY; // LMP is 14 days before conception
  const lmpDate = new Date(lmpMs);

  const daysSinceLmp = Math.floor((todayMs - lmpMs) / MS_PER_DAY);
  const totalDays = Math.max(0, daysSinceLmp);
  const currentWeeks = Math.floor(totalDays / 7);
  const currentDays = totalDays % 7;

  const daysRemaining = Math.max(0, Math.floor((dueDate.getTime() - todayMs) / MS_PER_DAY));

  // Determine trimester
  let trimester: 1 | 2 | 3;
  let trimesterProgress: number;
  if (currentWeeks < 13) {
    trimester = 1;
    trimesterProgress = (currentWeeks / 13) * 100;
  } else if (currentWeeks < 27) {
    trimester = 2;
    trimesterProgress = ((currentWeeks - 13) / 14) * 100;
  } else {
    trimester = 3;
    trimesterProgress = ((currentWeeks - 27) / 13) * 100;
  }

  // Key milestones (use translation keys)
  const milestonesData = [
    { week: 4, name: "pregnancy_milestone_implantation" },
    { week: 6, name: "pregnancy_milestone_heartbeat" },
    { week: 8, name: "pregnancy_milestone_organs" },
    { week: 12, name: "pregnancy_milestone_trimester1_end" },
    { week: 16, name: "pregnancy_milestone_gender" },
    { week: 20, name: "pregnancy_milestone_anatomy_scan" },
    { week: 24, name: "pregnancy_milestone_viability" },
    { week: 28, name: "pregnancy_milestone_trimester3" },
    { week: 32, name: "pregnancy_milestone_lungs" },
    { week: 37, name: "pregnancy_milestone_full_term" },
    { week: 40, name: "pregnancy_milestone_due_date" },
  ];

  const milestones = milestonesData.map(({ week, name }) => {
    const milestoneDate = addDays(lmpMs, week * 7);
    return {
      week,
      name,
      date: milestoneDate.toISOString().split("T")[0],
      passed: currentWeeks >= week,
    };
  });

  return {
    ok: true,
    value: {
      dueDate: dueDate.toISOString().split("T")[0],
      conceptionDate: conceptionDate.toISOString().split("T")[0],
      currentWeeks,
      currentDays,
      totalDays,
      daysRemaining,
      trimester,
      trimesterProgress: Math.min(100, trimesterProgress),
      milestones,
    },
  };
}
