"use client";

import { useTranslations } from "next-intl";
import { InputField, ResultGrid } from "@/components/converter";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  calculatePregnancyWeightGain,
  type PregnancyWeightGainInput,
  type PregnancyWeightGainResult,
} from "@/lib/converters/health/pregnancy-weight-gain";
import { PregnancyWeightGainFormSchema } from "@/lib/schemas/health";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  prePregnancyWeight: string;
  currentWeight: string;
  height: string;
  weeksPregnant: string;
  twins: boolean;
}

const useStore = createCalculatorStore<FormValues, PregnancyWeightGainResult | null>({
  name: "pregnancy-weight-gain-calculator",
  initialValues: {
    prePregnancyWeight: "60",
    currentWeight: "65",
    height: "165",
    weeksPregnant: "20",
    twins: false,
  },
  schema: PregnancyWeightGainFormSchema,
  calculate: (vals) => {
    const input: PregnancyWeightGainInput = {
      prePregnancyWeight: parseFloat(vals.prePregnancyWeight) || 0,
      currentWeight: parseFloat(vals.currentWeight) || 0,
      height: parseFloat(vals.height) || 0,
      weeksPregnant: parseInt(vals.weeksPregnant) || 0,
      twins: vals.twins,
    };
    return calculatePregnancyWeightGain(input);
  },
});

export function PregnancyWeightGainCalculator() {
  const t = useTranslations("calculator.labels");
  const tResults = useTranslations("calculator.results");

  const { values, setValue, result, errors, calculationError } = useStore();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on-track":
        return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300";
      case "under":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300";
      case "over":
        return "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          id="prePregnancyWeight"
          label={t("prePregnancyWeight")}
          value={values.prePregnancyWeight}
          onChange={(v) => setValue("prePregnancyWeight", v)}
          error={errors.prePregnancyWeight}
          min={0}
          step="0.1"
          placeholder="60"
        />

        <InputField
          id="currentWeight"
          label={t("currentWeight")}
          value={values.currentWeight}
          onChange={(v) => setValue("currentWeight", v)}
          error={errors.currentWeight}
          min={0}
          step="0.1"
          placeholder="65"
        />

        <InputField
          id="height"
          label={t("height")}
          value={values.height}
          onChange={(v) => setValue("height", v)}
          error={errors.height}
          min={0}
          step="0.1"
          placeholder="165"
        />

        <InputField
          id="weeksPregnant"
          label={t("weeksPregnant")}
          value={values.weeksPregnant}
          onChange={(v) => setValue("weeksPregnant", v)}
          error={errors.weeksPregnant}
          min={0}
          max={42}
          step="1"
          placeholder="20"
        />

        <div className="flex items-center space-x-2">
          <Switch
            id="twins"
            checked={values.twins}
            onCheckedChange={(checked) => setValue("twins", checked)}
          />
          <Label htmlFor="twins">{t("twins")}</Label>
        </div>
      </div>

      {result && (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${getStatusColor(result.status)}`}>
            <p className="font-semibold">
              {tResults("weightGainStatus")}:{" "}
              {result.status === "on-track"
                ? tResults("onTrack")
                : result.status === "under"
                  ? tResults("underTarget")
                  : tResults("overTarget")}
            </p>
            <p>
              {tResults("currentGain")}: {result.currentWeightGain.toFixed(1)} kg
            </p>
            <p>
              {tResults("recommendedAtWeek")}: {result.recommendedGainAtWeek.min.toFixed(1)} -{" "}
              {result.recommendedGainAtWeek.max.toFixed(1)} kg
            </p>
          </div>

          <ResultGrid
            results={[
              {
                label: tResults("prePregnancyBMI"),
                value: result.prePregnancyBmi.toFixed(1),
                unit: `(${result.bmiCategory})`,
              },
              {
                label: tResults("totalRecommendedGain"),
                value: `${result.recommendedGainMin.toFixed(1)} - ${result.recommendedGainMax.toFixed(1)}`,
                unit: "kg",
              },
              {
                label: tResults("weeklyGainRate"),
                value: `${result.weeklyGainRate.min.toFixed(2)} - ${result.weeklyGainRate.max.toFixed(2)}`,
                unit: "kg/week",
              },
              {
                label: tResults("projectedTotalGain"),
                value: result.projectedTotalGain.toFixed(1),
                unit: "kg",
              },
            ]}
          />

          <h3 className="text-lg font-semibold">{tResults("weightBreakdown")}</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {Object.entries(result.breakdown).map(([key, value]) => (
              <div key={key} className="flex justify-between p-2 bg-muted rounded">
                <span className="capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                <span className="font-medium">{value} kg</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
