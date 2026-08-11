"use client";

import { useTranslations } from "next-intl";
import { InputField } from "@/components/converter";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  calculateSleep,
  type SleepInput,
  type SleepResult,
} from "@/lib/converters/health/sleep-calculator";
import { SleepFormSchema } from "@/lib/schemas/health";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  mode: "wakeTime" | "bedTime";
  targetTime: string;
  age: string;
}

const useStore = createCalculatorStore<FormValues, SleepResult | null>({
  name: "sleep-calculator",
  initialValues: {
    mode: "wakeTime",
    targetTime: "07:00",
    age: "30",
  },
  schema: SleepFormSchema,
  calculate: (vals) => {
    const input: SleepInput = {
      mode: vals.mode,
      targetTime: vals.targetTime,
      age: parseInt(vals.age) || 30,
    };
    return calculateSleep(input);
  },
});

export function SleepCalculatorComponent() {
  const t = useTranslations("calculator.labels");
  const tResults = useTranslations("calculator.results");

  const { values, setValue, result, errors, calculationError } = useStore();

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "optimal":
        return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300";
      case "good":
        return "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300";
      default:
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("calculationMode")}</Label>
          <Select
            value={values.mode}
            onValueChange={(v) => setValue("mode", v as "wakeTime" | "bedTime")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="wakeTime">{t("iWantToWakeUpAt")}</SelectItem>
              <SelectItem value="bedTime">{t("iWantToGoToBedAt")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{values.mode === "wakeTime" ? t("wakeUpTime") : t("bedTime")}</Label>
          <input
            type="time"
            value={values.targetTime}
            onChange={(e) => setValue("targetTime", e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <InputField
          id="age"
          label={t("age")}
          value={values.age}
          onChange={(v) => setValue("age", v)}
          error={errors.age}
          min={1}
          max={120}
          step="1"
          placeholder="30"
        />
      </div>

      {result && (
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg text-center">
            <p className="text-sm text-muted-foreground">{tResults("recommendedSleep")}</p>
            <p className="text-2xl font-bold">
              {result.recommendedHours.min} - {result.recommendedHours.max} {t("hours")}
            </p>
          </div>

          <h3 className="text-lg font-semibold">
            {values.mode === "wakeTime"
              ? tResults("suggestedBedtimes")
              : tResults("suggestedWakeTimes")}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {result.cycleTimes.map((cycle) => (
              <div
                key={cycle.cycles}
                className={`p-4 rounded-lg ${getQualityColor(cycle.quality)}`}
              >
                <p className="text-2xl font-bold">{cycle.time}</p>
                <p className="text-sm">
                  {cycle.cycles} {tResults("sleepCycles")} ({cycle.duration})
                </p>
                <p className="text-xs">{tResults(cycle.quality)}</p>
              </div>
            ))}
          </div>

          <h3 className="text-lg font-semibold">{tResults("sleepStages")}</h3>
          <div className="space-y-2">
            {result.sleepStages.map((stage) => (
              <div key={stage.stage} className="p-3 bg-muted rounded-lg">
                <div className="flex justify-between">
                  <span className="font-medium">{tResults(stage.stage)}</span>
                  <span className="text-sm text-muted-foreground">{tResults(stage.duration)}</span>
                </div>
                <p className="text-sm text-muted-foreground">{tResults(stage.description)}</p>
              </div>
            ))}
          </div>

          <h3 className="text-lg font-semibold">{tResults("sleepTips")}</h3>
          <ul className="list-disc list-inside space-y-1 bg-muted p-4 rounded-lg">
            {result.tips.map((tip) => (
              <li key={tip} className="text-sm">
                {tResults(tip)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
