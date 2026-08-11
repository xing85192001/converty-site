"use client";

import { useTranslations } from "next-intl";
import { InputField, OutputDisplay, ResultGrid } from "@/components/converter";
import {
  calculateTargetHeartRate,
  type TargetHeartRateInput,
  type TargetHeartRateResult,
} from "@/lib/converters/health/target-heart-rate";
import { TargetHeartRateFormSchema } from "@/lib/schemas/health";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  age: string;
  restingHeartRate: string;
}

const useStore = createCalculatorStore<FormValues, TargetHeartRateResult | null>({
  name: "target-heart-rate-calculator",
  initialValues: {
    age: "30",
    restingHeartRate: "60",
  },
  schema: TargetHeartRateFormSchema,
  calculate: (vals) => {
    const input: TargetHeartRateInput = {
      age: parseFloat(vals.age) || 0,
      restingHeartRate: parseFloat(vals.restingHeartRate) || undefined,
    };
    return calculateTargetHeartRate(input);
  },
});

export function TargetHeartRateCalculator() {
  const t = useTranslations("calculator.labels");
  const tResults = useTranslations("calculator.results");

  const { values, setValue, result, errors, calculationError } = useStore();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          id="age"
          label={t("age")}
          value={values.age}
          onChange={(v) => setValue("age", v)}
          error={errors.age}
          min={0}
          max={120}
          step="1"
          placeholder="30"
        />

        <InputField
          id="restingHeartRate"
          label={t("restingHeartRate")}
          value={values.restingHeartRate}
          onChange={(v) => setValue("restingHeartRate", v)}
          error={errors.restingHeartRate}
          min={30}
          max={120}
          step="1"
          placeholder="60"
        />
      </div>

      {result && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <OutputDisplay
              label={tResults("maxHeartRate")}
              value={result.maxHeartRate}
              unit="bpm"
              size="lg"
            />
            {result.heartRateReserve && (
              <OutputDisplay
                label={tResults("heartRateReserve")}
                value={result.heartRateReserve}
                unit="bpm"
              />
            )}
          </div>

          <h3 className="text-lg font-semibold">{tResults("heartRateZones")}</h3>
          <div className="space-y-2">
            {result.zones.map((zone) => (
              <div
                key={zone.name}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">{tResults(zone.name)}</p>
                  <p className="text-sm text-muted-foreground">{tResults(zone.description)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {zone.minBpm} - {zone.maxBpm} bpm
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {zone.minPercent}% - {zone.maxPercent}%
                  </p>
                </div>
              </div>
            ))}
          </div>

          <ResultGrid
            results={[
              {
                label: tResults("fatBurningZone"),
                value: `${result.fatBurningZone.min} - ${result.fatBurningZone.max}`,
                unit: "bpm",
              },
              {
                label: tResults("cardioZone"),
                value: `${result.cardioZone.min} - ${result.cardioZone.max}`,
                unit: "bpm",
              },
            ]}
          />
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
