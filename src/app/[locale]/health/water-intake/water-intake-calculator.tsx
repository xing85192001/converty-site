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
import { Switch } from "@/components/ui/switch";
import {
  calculateWaterIntake,
  type WaterIntakeInput,
  type WaterIntakeResult,
} from "@/lib/converters/health/water-intake-calculator";
import { WaterIntakeFormSchema } from "@/lib/schemas/health";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  weight: string;
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "athlete";
  climate: "temperate" | "hot" | "humid" | "cold";
  pregnant: boolean;
  breastfeeding: boolean;
}

const useStore = createCalculatorStore<FormValues, WaterIntakeResult | null>({
  name: "water-intake-calculator",
  initialValues: {
    weight: "70",
    activityLevel: "moderate",
    climate: "temperate",
    pregnant: false,
    breastfeeding: false,
  },
  schema: WaterIntakeFormSchema,
  calculate: (vals) => {
    const input: WaterIntakeInput = {
      weight: parseFloat(vals.weight) || 0,
      activityLevel: vals.activityLevel,
      climate: vals.climate,
      pregnant: vals.pregnant,
      breastfeeding: vals.breastfeeding,
    };
    return calculateWaterIntake(input);
  },
});

export function WaterIntakeCalculator() {
  const t = useTranslations("calculator.labels");
  const tResults = useTranslations("calculator.results");
  const tWater = useTranslations("calculator.health.water");

  const { values, setValue, result, errors, calculationError } = useStore();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          id="weight"
          label={t("weight")}
          value={values.weight}
          onChange={(v) => setValue("weight", v)}
          error={errors.weight}
          min={0}
          step="0.1"
          placeholder="70"
        />

        <div className="space-y-2">
          <Label>{t("activityLevel")}</Label>
          <Select
            value={values.activityLevel}
            onValueChange={(v) => setValue("activityLevel", v as typeof values.activityLevel)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sedentary">{t("sedentary")}</SelectItem>
              <SelectItem value="light">{t("light")}</SelectItem>
              <SelectItem value="moderate">{t("moderate")}</SelectItem>
              <SelectItem value="active">{t("active")}</SelectItem>
              <SelectItem value="athlete">{t("athlete")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t("climate")}</Label>
          <Select
            value={values.climate}
            onValueChange={(v) => setValue("climate", v as typeof values.climate)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="temperate">{t("temperate")}</SelectItem>
              <SelectItem value="hot">{t("hot")}</SelectItem>
              <SelectItem value="humid">{t("humid")}</SelectItem>
              <SelectItem value="cold">{t("cold")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="pregnant"
              checked={values.pregnant}
              onCheckedChange={(checked) => setValue("pregnant", checked)}
            />
            <Label htmlFor="pregnant">{t("pregnant")}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="breastfeeding"
              checked={values.breastfeeding}
              onCheckedChange={(checked) => setValue("breastfeeding", checked)}
            />
            <Label htmlFor="breastfeeding">{t("breastfeeding")}</Label>
          </div>
        </div>
      </div>

      {result && (
        <div className="space-y-4">
          <OutputDisplay
            label={tResults("dailyWaterIntake")}
            value={result.dailyIntakeLiters.toFixed(1)}
            unit="L"
            size="lg"
          />

          <ResultGrid
            results={[
              {
                label: tResults("milliliters"),
                value: Math.round(result.dailyIntakeMl),
                unit: "ml",
              },
              {
                label: tResults("ounces"),
                value: Math.round(result.dailyIntakeOz),
                unit: "oz",
              },
              {
                label: tResults("cups"),
                value: Math.round(result.dailyIntakeCups),
                unit: "cups",
              },
              {
                label: tResults("hourlyReminder"),
                value: result.hourlyReminder,
                unit: "ml/h",
              },
            ]}
          />

          <h3 className="text-lg font-semibold">{tResults("breakdown")}</h3>
          <ResultGrid
            results={[
              {
                label: tResults("baseNeeds"),
                value: Math.round(result.breakdown.baseNeeds),
                unit: "ml",
              },
              {
                label: tResults("activityAddition"),
                value: result.breakdown.activityAddition,
                unit: "ml",
              },
              {
                label: tResults("climateAddition"),
                value: result.breakdown.climateAddition,
                unit: "ml",
              },
              {
                label: tResults("specialAddition"),
                value: result.breakdown.specialAddition,
                unit: "ml",
              },
            ]}
          />

          <h3 className="text-lg font-semibold">{tResults("drinkingSchedule")}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-semibold">{t("time")}</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold">{t("amount")}</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold">
                    {tResults("cumulative")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result.schedule.map((item) => (
                  <tr key={item.timeKey}>
                    <td className="px-3 py-2 text-sm">{tWater(`schedule.${item.timeKey}`)}</td>
                    <td className="px-3 py-2 text-sm">{item.amount} ml</td>
                    <td className="px-3 py-2 text-sm">{item.cumulative} ml</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold">{tResults("hydrationTips")}</h3>
          <ul className="list-disc list-inside space-y-1 bg-muted p-4 rounded-lg">
            {result.tipKeys.map((tipKey) => (
              <li key={tipKey} className="text-sm">
                {tWater(`tips.${tipKey}`)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
