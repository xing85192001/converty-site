import type { CalculationResult } from "@/types";

export interface PeriodInput {
  lastPeriodDate: string; // ISO date string
  cycleLength: number; // days
  periodLength: number; // days
}

export interface PeriodResult {
  nextPeriodDate: string;
  daysUntilNextPeriod: number;
  currentPhase: "menstrual" | "follicular" | "ovulation" | "luteal";
  phaseDay: number;
  ovulationDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  upcomingPeriods: Array<{
    periodNumber: number;
    startDate: string;
    endDate: string;
    ovulation: string;
  }>;
  cyclePhases: Array<{
    phase: string;
    startDay: number;
    endDay: number;
    description: string;
  }>;
  pmsStartDate: string;
}

export function calculatePeriod(input: PeriodInput): CalculationResult<PeriodResult> {
  const { lastPeriodDate, cycleLength, periodLength } = input;

  const lmpDate = new Date(lastPeriodDate);
  if (
    Number.isNaN(lmpDate.getTime()) ||
    cycleLength < 21 ||
    cycleLength > 40 ||
    periodLength < 2 ||
    periodLength > 10
  ) {
    return {
      ok: false,
      error: "Invalid date, cycle length must be 21-40 days, period length must be 2-10 days",
      code: "INVALID_INPUT",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate days since last period
  const daysSincePeriod = Math.floor((today.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24));

  // Calculate current cycle day (1-indexed)
  const currentCycleDay =
    ((daysSincePeriod % cycleLength) + cycleLength) % cycleLength || cycleLength;

  // Next period date
  const daysUntilNextPeriod = cycleLength - currentCycleDay;
  const nextPeriodDate = new Date(today);
  nextPeriodDate.setDate(nextPeriodDate.getDate() + daysUntilNextPeriod);

  // Ovulation day (typically 14 days before next period)
  const ovulationDay = cycleLength - 14;
  const ovulationDate = new Date(lmpDate);
  ovulationDate.setDate(ovulationDate.getDate() + ovulationDay);

  // If ovulation has passed this cycle, calculate for next
  if (currentCycleDay > ovulationDay) {
    ovulationDate.setDate(ovulationDate.getDate() + cycleLength);
  }

  // Fertile window (5 days before ovulation to 1 day after)
  const fertileWindowStart = new Date(ovulationDate);
  fertileWindowStart.setDate(fertileWindowStart.getDate() - 5);

  const fertileWindowEnd = new Date(ovulationDate);
  fertileWindowEnd.setDate(fertileWindowEnd.getDate() + 1);

  // PMS typically starts 7-10 days before period
  const pmsStartDate = new Date(nextPeriodDate);
  pmsStartDate.setDate(pmsStartDate.getDate() - 7);

  // Determine current phase
  let currentPhase: "menstrual" | "follicular" | "ovulation" | "luteal";
  let phaseDay: number;

  if (currentCycleDay <= periodLength) {
    currentPhase = "menstrual";
    phaseDay = currentCycleDay;
  } else if (currentCycleDay <= ovulationDay - 2) {
    currentPhase = "follicular";
    phaseDay = currentCycleDay - periodLength;
  } else if (currentCycleDay <= ovulationDay + 1) {
    currentPhase = "ovulation";
    phaseDay = currentCycleDay - (ovulationDay - 2);
  } else {
    currentPhase = "luteal";
    phaseDay = currentCycleDay - ovulationDay - 1;
  }

  // Cycle phases breakdown (use translation keys)
  const cyclePhases = [
    {
      phase: "period_phase_menstrual_name",
      startDay: 1,
      endDay: periodLength,
      description: "period_phase_menstrual_desc",
    },
    {
      phase: "period_phase_follicular_name",
      startDay: periodLength + 1,
      endDay: ovulationDay - 2,
      description: "period_phase_follicular_desc",
    },
    {
      phase: "period_phase_ovulation_name",
      startDay: ovulationDay - 1,
      endDay: ovulationDay + 1,
      description: "period_phase_ovulation_desc",
    },
    {
      phase: "period_phase_luteal_name",
      startDay: ovulationDay + 2,
      endDay: cycleLength,
      description: "period_phase_luteal_desc",
    },
  ];

  // Calculate upcoming 6 periods
  const upcomingPeriods: PeriodResult["upcomingPeriods"] = [];
  for (let i = 0; i < 6; i++) {
    const periodStart = new Date(nextPeriodDate);
    periodStart.setDate(periodStart.getDate() + cycleLength * i);

    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodEnd.getDate() + periodLength - 1);

    const ov = new Date(periodStart);
    ov.setDate(ov.getDate() + ovulationDay);

    upcomingPeriods.push({
      periodNumber: i + 1,
      startDate: periodStart.toISOString().split("T")[0],
      endDate: periodEnd.toISOString().split("T")[0],
      ovulation: ov.toISOString().split("T")[0],
    });
  }

  return {
    ok: true,
    value: {
      nextPeriodDate: nextPeriodDate.toISOString().split("T")[0],
      daysUntilNextPeriod:
        daysUntilNextPeriod > 0 ? daysUntilNextPeriod : daysUntilNextPeriod + cycleLength,
      currentPhase,
      phaseDay,
      ovulationDate: ovulationDate.toISOString().split("T")[0],
      fertileWindowStart: fertileWindowStart.toISOString().split("T")[0],
      fertileWindowEnd: fertileWindowEnd.toISOString().split("T")[0],
      upcomingPeriods,
      cyclePhases,
      pmsStartDate: pmsStartDate.toISOString().split("T")[0],
    },
  };
}
