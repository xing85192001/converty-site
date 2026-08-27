"use client";

import { useTranslations } from "next-intl";
import { InputField, OutputDisplay, ResultGrid } from "@/components/converter";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  calculateDueDate,
  type DueDateInput,
  type DueDateResult,
} from "@/lib/converters/health/pregnancy-due-date";
import { DueDateFormSchema } from "@/lib/schemas/health";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  calculationMethod: "lmp" | "conception" | "ultrasound" | "ivf";
  date: string;
  cycleLength: string;
  ultrasoundWeeks: string;
  ultrasoundDays: string;
}

const today = new Date().toISOString().split("T")[0];

const useStore = createCalculatorStore<FormValues, DueDateResult | null>({
  name: "due-date-calculator",
  initialValues: {
    calculationMethod: "lmp",
    date: today,
    cycleLength: "28",
    ultrasoundWeeks: "8",
    ultrasoundDays: "0",
  },
  schema: DueDateFormSchema,
  calculate: (vals) => {
    const input: DueDateInput = {
      calculationMethod: vals.calculationMethod,
      date: vals.date,
      cycleLength: parseInt(vals.cycleLength) || 28,
      ultrasoundWeeks: parseInt(vals.ultrasoundWeeks) || 0,
      ultrasoundDays: parseInt(vals.ultrasoundDays) || 0,
    };
    return calculateDueDate(input);
  },
});

export function DueDateCalculator() {
  const t = useTranslations("calculator.labels");
  const tResults = useTranslations("calculator.results");

  const { values, setValue, result, errors, calculationError } = useStore();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("calculationMethod")}</Label>
          <Select
            value={values.calculationMethod}
            onValueChange={(v) =>
              setValue("calculationMethod", v as typeof values.calculationMethod)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lmp">{t("lastMenstrualPeriod")}</SelectItem>
              <SelectItem value="conception">{t("conceptionDate")}</SelectItem>
              <SelectItem value="ultrasound">{t("ultrasoundDate")}</SelectItem>
              <SelectItem value="ivf">{t("ivfTransferDate")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t("date")}</Label>
          <input
            type="date"
            value={values.date}
            onChange={(e) => setValue("date", e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        {values.calculationMethod === "lmp" && (
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
        )}

        {values.calculationMethod === "ultrasound" && (
          <>
            <InputField
              id="ultrasoundWeeks"
              label={t("gestationalWeeks")}
              value={values.ultrasoundWeeks}
              onChange={(v) => setValue("ultrasoundWeeks", v)}
              error={errors.ultrasoundWeeks}
              min={0}
              max={42}
              step="1"
              placeholder="8"
            />
            <InputField
              id="ultrasoundDays"
              label={t("gestationalDays")}
              value={values.ultrasoundDays}
              onChange={(v) => setValue("ultrasoundDays", v)}
              error={errors.ultrasoundDays}
              min={0}
              max={6}
              step="1"
              placeholder="0"
            />
          </>
        )}
      </div>

      {result && (
        <div className="space-y-4">
          <OutputDisplay
            label={tResults("estimatedDueDate")}
            value={result.dueDate}
            unit=""
            size="lg"
          />

          <ResultGrid
            results={[
              {
                label: tResults("currentWeek"),
                value: `${result.currentWeeks}w ${result.currentDays}d`,
                unit: "",
              },
              {
                label: tResults("trimester"),
                value: result.trimester.toString(),
                unit: "",
              },
              {
                label: tResults("daysRemaining"),
                value: result.daysRemaining.toString(),
                unit: t("days"),
              },
              {
                label: tResults("conceptionDate"),
                value: result.conceptionDate,
                unit: "",
              },
            ]}
          />

          <div className="w-full bg-muted rounded-full h-4">
            <div
              className="bg-primary h-4 rounded-full transition-all"
              style={{ width: `${Math.min(100, (result.totalDays / 280) * 100)}%` }}
            />
          </div>
          <p className="text-sm text-center text-muted-foreground">
            {Math.round((result.totalDays / 280) * 100)}% {tResults("complete")}
          </p>

          <h3 className="text-lg font-semibold">{tResults("milestones")}</h3>
          <div className="space-y-2">
            {result.milestones.map((milestone) => (
              <div
                key={milestone.week}
                className={`flex justify-between items-center p-2 rounded ${
                  milestone.passed ? "bg-green-100 dark:bg-green-900" : "bg-muted"
                }`}
              >
                <span className="font-medium">Week {milestone.week}</span>
                <span>{tResults(milestone.name)}</span>
                <span className="text-sm text-muted-foreground">{milestone.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
