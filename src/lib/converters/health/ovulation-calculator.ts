import type { CalculationResult } from "@/types";

export interface OvulationInput {
  lastPeriodDate: string; // ISO date string
  cycleLength: number; // days
  periodLength?: number; // days
}

export interface OvulationResult {
  ovulationDate: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  nextPeriodDate: string;
  safePeriodsBefore: { start: string; end: string };
  safePeriodsAfter: { start: string; end: string };
  fertileWindow: Array<{
    date: string;
    fertility: "low" | "medium" | "high" | "peak";
    dayOfCycle: number;
  }>;
  upcomingCycles: Array<{
    cycleNumber: number;
    periodStart: string;
    ovulation: string;
    fertileStart: string;
    fertileEnd: string;
  }>;
}

export function calculateOvulation(input: OvulationInput): CalculationResult<OvulationResult> {
  const { lastPeriodDate, cycleLength, periodLength: _periodLength = 5 } = input;

  const lmpDate = new Date(lastPeriodDate);
  if (Number.isNaN(lmpDate.getTime()) || cycleLength < 21 || cycleLength > 40) {
    return {
      ok: false,
      error: "Invalid date or cycle length must be between 21 and 40 days",
      code: "INVALID_INPUT",
    };
  }

  // Ovulation typically occurs 14 days before the next period
  const lutealPhase = 14;
  const ovulationDay = cycleLength - lutealPhase;

  const ovulationDate = new Date(lmpDate);
  ovulationDate.setDate(ovulationDate.getDate() + ovulationDay);

  // Fertile window: 5 days before ovulation to 1 day after
  const fertileWindowStart = new Date(ovulationDate);
  fertileWindowStart.setDate(fertileWindowStart.getDate() - 5);

  const fertileWindowEnd = new Date(ovulationDate);
  fertileWindowEnd.setDate(fertileWindowEnd.getDate() + 1);

  // Next period date
  const nextPeriodDate = new Date(lmpDate);
  nextPeriodDate.setDate(nextPeriodDate.getDate() + cycleLength);

  // Safe periods (relatively safe - not 100% reliable)
  const safePeriodsBefore = {
    start: lastPeriodDate,
    end: new Date(fertileWindowStart.getTime() - 86400000).toISOString().split("T")[0],
  };

  const safePeriodsAfter = {
    start: new Date(fertileWindowEnd.getTime() + 86400000).toISOString().split("T")[0],
    end: new Date(nextPeriodDate.getTime() - 86400000).toISOString().split("T")[0],
  };

  // Detailed fertile window with fertility levels
  const fertileWindow: OvulationResult["fertileWindow"] = [];
  for (let i = -5; i <= 1; i++) {
    const date = new Date(ovulationDate);
    date.setDate(date.getDate() + i);

    let fertility: "low" | "medium" | "high" | "peak";
    if (i === 0) {
      fertility = "peak";
    } else if (i === -1 || i === 1) {
      fertility = "high";
    } else if (i === -2 || i === -3) {
      fertility = "medium";
    } else {
      fertility = "low";
    }

    fertileWindow.push({
      date: date.toISOString().split("T")[0],
      fertility,
      dayOfCycle: ovulationDay + i,
    });
  }

  // Calculate upcoming 6 cycles
  const upcomingCycles: OvulationResult["upcomingCycles"] = [];
  for (let cycle = 1; cycle <= 6; cycle++) {
    const periodStart = new Date(lmpDate);
    periodStart.setDate(periodStart.getDate() + cycleLength * cycle);

    const ov = new Date(periodStart);
    ov.setDate(ov.getDate() + ovulationDay);

    const fertStart = new Date(ov);
    fertStart.setDate(fertStart.getDate() - 5);

    const fertEnd = new Date(ov);
    fertEnd.setDate(fertEnd.getDate() + 1);

    upcomingCycles.push({
      cycleNumber: cycle,
      periodStart: periodStart.toISOString().split("T")[0],
      ovulation: ov.toISOString().split("T")[0],
      fertileStart: fertStart.toISOString().split("T")[0],
      fertileEnd: fertEnd.toISOString().split("T")[0],
    });
  }

  return {
    ok: true,
    value: {
      ovulationDate: ovulationDate.toISOString().split("T")[0],
      fertileWindowStart: fertileWindowStart.toISOString().split("T")[0],
      fertileWindowEnd: fertileWindowEnd.toISOString().split("T")[0],
      nextPeriodDate: nextPeriodDate.toISOString().split("T")[0],
      safePeriodsBefore,
      safePeriodsAfter,
      fertileWindow,
      upcomingCycles,
    },
  };
}
