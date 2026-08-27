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
  type BacInput,
  type BacResult,
  calculateBac,
} from "@/lib/converters/health/bac-calculator";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  gender: "male" | "female";
  weight: string;
  drinks: string;
  drinkType: "beer" | "wine" | "spirits" | "custom";
  hoursSinceDrinking: string;
}

const useStore = createCalculatorStore<FormValues, BacResult | null>({
  name: "bac-calculator",
  initialValues: {
    gender: "male",
    weight: "75",
    drinks: "2",
    drinkType: "beer",
    hoursSinceDrinking: "1",
  },
  calculate: (vals) => {
    const input: BacInput = {
      gender: vals.gender,
      weight: parseFloat(vals.weight) || 0,
      drinks: parseFloat(vals.drinks) || 0,
      drinkType: vals.drinkType,
      hoursSinceDrinking: parseFloat(vals.hoursSinceDrinking) || 0,
    };
    return calculateBac(input);
  },
});

export function BacCalculatorComponent() {
  const t = useTranslations("calculator.labels");
  const tResults = useTranslations("calculator.results");

  const { values, setValue, result, calculationError } = useStore();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("gender")}</Label>
          <Select
            value={values.gender}
            onValueChange={(v) => setValue("gender", v as "male" | "female")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">{t("male")}</SelectItem>
              <SelectItem value="female">{t("female")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <InputField
          id="weight"
          label={t("weight")}
          value={values.weight}
          onChange={(v) => setValue("weight", v)}
          min={0}
          step="0.5"
          placeholder="75"
        />

        <InputField
          id="drinks"
          label={t("numberOfDrinks")}
          value={values.drinks}
          onChange={(v) => setValue("drinks", v)}
          min={0}
          step="0.5"
          placeholder="2"
        />

        <div className="space-y-2">
          <Label>{t("drinkType")}</Label>
          <Select
            value={values.drinkType}
            onValueChange={(v) => setValue("drinkType", v as typeof values.drinkType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beer">{t("beer")}</SelectItem>
              <SelectItem value="wine">{t("wine")}</SelectItem>
              <SelectItem value="spirits">{t("spirits")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <InputField
          id="hoursSinceDrinking"
          label={t("hoursSinceDrinking")}
          value={values.hoursSinceDrinking}
          onChange={(v) => setValue("hoursSinceDrinking", v)}
          min={0}
          step="0.5"
          placeholder="1"
        />
      </div>

      {result && (
        <div className="space-y-4">
          <OutputDisplay
            label={tResults("currentBAC")}
            value={result.bac.toFixed(3)}
            unit="%"
            size="lg"
          />

          <div
            className={`p-4 rounded-lg ${result.legalToDrive ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"}`}
          >
            <p className="font-semibold">
              {tResults("status")}: {tResults(result.status)}
            </p>
            <p
              className={
                result.legalToDrive
                  ? "text-green-700 dark:text-green-300"
                  : "text-red-700 dark:text-red-300"
              }
            >
              {result.legalToDrive ? tResults("legalToDrive") : tResults("notLegalToDrive")}
            </p>
          </div>

          <ResultGrid
            results={[
              {
                label: tResults("peakBAC"),
                value: result.peakBac.toFixed(3),
                unit: "%",
              },
              {
                label: tResults("alcoholConsumed"),
                value: result.alcoholGrams.toFixed(0),
                unit: "g",
              },
              {
                label: tResults("timeToSober"),
                value: result.timeToSober.toFixed(1),
                unit: t("hours"),
              },
              {
                label: tResults("timeToLegal"),
                value: result.timeToLegal.toFixed(1),
                unit: t("hours"),
              },
            ]}
          />

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">{tResults("currentEffects")}</h4>
            <ul className="list-disc list-inside space-y-1">
              {result.effects.map((effect) => (
                <li key={effect} className="text-sm">
                  {tResults(effect)}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-muted-foreground">{tResults("bacDisclaimer")}</p>
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
