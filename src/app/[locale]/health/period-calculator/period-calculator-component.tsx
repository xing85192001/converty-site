"use client";

import { useTranslations } from "next-intl";
import { InputField, ResultGrid } from "@/components/converter";
import { Label } from "@/components/ui/label";
import {
  calculatePeriod,
  type PeriodInput,
  type PeriodResult,
} from "@/lib/converters/health/period-calculator";
import { PeriodFormSchema } from "@/lib/schemas/health";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  lastPeriodDate: string;
  cycleLength: string;
  periodLength: string;
}

const today = new Date().toISOString().split("T")[0];

const useStore = createCalculatorStore<FormValues, PeriodResult | null>({
  name: "period-calculator",
  initialValues: {
    lastPeriodDate: today,
    cycleLength: "28",
    periodLength: "5",
  },
  schema: PeriodFormSchema,
  calculate: (vals) => {
    const input: PeriodInput = {
      lastPeriodDate: vals.lastPeriodDate,
      cycleLength: parseInt(vals.cycleLength) || 28,
      periodLength: parseInt(vals.periodLength) || 5,
    };
    return calculatePeriod(input);
  },
});

export function PeriodCalculatorComponent() {
  const t = useTranslations("calculator.labels");
  const tResults = useTranslations("calculator.results");

  const { values, setValue, result, errors, calculationError } = useStore();

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "menstrual":
        return "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300";
      case "follicular":
        return "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300";
      case "ovulation":
        return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300";
      case "luteal":
        return "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("lastPeriodDate")}</Label>
          <input
            type="date"
            value={values.lastPeriodDate}
            onChange={(e) => setValue("lastPeriodDate", e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <InputField
          id="cycleLength"
          label={t("cycleLength")}
          value={values.cycleLength}
          onChange={(v) => setValue("cycleLength", v)}
          error={errors.cycleLength}
          min={21}
          max={40}
          step="1"
          placeholder="28"
        />

        <InputField
          id="periodLength"
          label={t("periodLength")}
          value={values.periodLength}
          onChange={(v) => setValue("periodLength", v)}
          error={errors.periodLength}
          min={2}
          max={10}
          step="1"
          placeholder="5"
        />
      </div>

      {result && (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg text-center ${getPhaseColor(result.currentPhase)}`}>
            <p className="text-sm text-muted-foreground">{tResults("currentPhase")}</p>
            <p className="text-2xl font-bold">{tResults(result.currentPhase)}</p>
            <p className="text-sm">
              {tResults("day")} {result.phaseDay}
            </p>
          </div>

          <ResultGrid
            results={[
              {
                label: tResults("nextPeriod"),
                value: result.nextPeriodDate,
              },
              {
                label: tResults("daysUntilPeriod"),
                value: result.daysUntilNextPeriod,
                unit: t("days"),
              },
              {
                label: tResults("ovulationDate"),
                value: result.ovulationDate,
              },
              {
                label: tResults("pmsStart"),
                value: result.pmsStartDate,
              },
            ]}
          />

          <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-2">
              {tResults("fertileWindow")}
            </h3>
            <p className="text-green-600 dark:text-green-400">
              {result.fertileWindowStart} - {result.fertileWindowEnd}
            </p>
          </div>

          <h3 className="text-lg font-semibold">{tResults("cyclePhases")}</h3>
          <div className="space-y-2">
            {result.cyclePhases.map((phase) => (
              <div key={phase.phase} className="p-3 bg-muted rounded-lg">
                <div className="flex justify-between">
                  <span className="font-medium">{tResults(phase.phase)}</span>
                  <span className="text-sm text-muted-foreground">
                    {tResults("days")} {phase.startDay} - {phase.endDay}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{tResults(phase.description)}</p>
              </div>
            ))}
          </div>

          <h3 className="text-lg font-semibold">{tResults("upcomingPeriods")}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-semibold">#</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold">
                    {tResults("periodStart")}
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-semibold">
                    {tResults("periodEnd")}
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-semibold">
                    {tResults("ovulation")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result.upcomingPeriods.map((period) => (
                  <tr key={period.periodNumber}>
                    <td className="px-3 py-2 text-sm">{period.periodNumber}</td>
                    <td className="px-3 py-2 text-sm">{period.startDate}</td>
                    <td className="px-3 py-2 text-sm">{period.endDate}</td>
                    <td className="px-3 py-2 text-sm">{period.ovulation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
