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
  type ArmyBodyFatInput,
  type ArmyBodyFatResult,
  calculateArmyBodyFat,
} from "@/lib/converters/health/army-body-fat";
import { ArmyBodyFatFormSchema } from "@/lib/schemas/health";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  gender: "male" | "female";
  age: string;
  height: string;
  neck: string;
  waist: string;
  hip: string;
}

const useStore = createCalculatorStore<FormValues, ArmyBodyFatResult | null>({
  name: "army-body-fat-calculator",
  initialValues: {
    gender: "male",
    age: "25",
    height: "175",
    neck: "38",
    waist: "85",
    hip: "95",
  },
  schema: ArmyBodyFatFormSchema,
  calculate: (vals) => {
    const input: ArmyBodyFatInput = {
      gender: vals.gender,
      age: parseInt(vals.age) || 0,
      height: parseFloat(vals.height) || 0,
      neck: parseFloat(vals.neck) || 0,
      waist: parseFloat(vals.waist) || 0,
      hip: vals.gender === "female" ? parseFloat(vals.hip) || undefined : undefined,
    };
    return calculateArmyBodyFat(input);
  },
});

export function ArmyBodyFatCalculator() {
  const t = useTranslations("calculator.labels");
  const tResults = useTranslations("calculator.results");

  const { values, setValue, result, errors, calculationError } = useStore();

  const getStatusColor = (category: "pass" | "tape" | "fail") => {
    switch (category) {
      case "pass":
        return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300";
      case "tape":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300";
      case "fail":
        return "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300";
    }
  };

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
          id="age"
          label={t("age")}
          value={values.age}
          onChange={(v) => setValue("age", v)}
          error={errors.age}
          min={17}
          max={60}
          step="1"
          placeholder="25"
        />

        <InputField
          id="height"
          label={t("height")}
          value={values.height}
          onChange={(v) => setValue("height", v)}
          error={errors.height}
          min={100}
          max={250}
          step="0.5"
          placeholder="175"
        />

        <InputField
          id="neck"
          label={t("neckCircumference")}
          value={values.neck}
          onChange={(v) => setValue("neck", v)}
          error={errors.neck}
          min={20}
          max={60}
          step="0.5"
          placeholder="38"
        />

        <InputField
          id="waist"
          label={t("waistCircumference")}
          value={values.waist}
          onChange={(v) => setValue("waist", v)}
          error={errors.waist}
          min={40}
          max={200}
          step="0.5"
          placeholder="85"
        />

        {values.gender === "female" && (
          <InputField
            id="hip"
            label={t("hipCircumference")}
            value={values.hip}
            onChange={(v) => setValue("hip", v)}
            error={errors.hip}
            min={50}
            max={200}
            step="0.5"
            placeholder="95"
          />
        )}
      </div>

      {result && (
        <div className="space-y-4">
          <OutputDisplay
            label={tResults("bodyFatPercent")}
            value={result.bodyFatPercent.toFixed(1)}
            unit="%"
            size="lg"
          />

          <div className={`p-4 rounded-lg text-center ${getStatusColor(result.armyCategory)}`}>
            <p className="text-lg font-bold">
              {result.armyCategory === "pass" && tResults("passesStandard")}
              {result.armyCategory === "tape" && tResults("borderlinePass")}
              {result.armyCategory === "fail" && tResults("failsStandard")}
            </p>
            <p className="text-sm">
              {tResults("maxAllowed")}: {result.maxAllowedPercent}%
            </p>
          </div>

          <ResultGrid
            results={[
              {
                label: tResults("bodyFatCategory"),
                value: tResults(result.category),
              },
              {
                label: tResults("circumferenceValue"),
                value: result.circumferenceValue.toFixed(1),
                unit: "cm",
              },
            ]}
          />

          <h3 className="text-lg font-semibold">{tResults("armyStandards")}</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-semibold">{t("ageGroup")}</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold">{t("male")}</th>
                  <th className="px-3 py-2 text-left text-sm font-semibold">{t("female")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-3 py-2 text-sm">17-20</td>
                  <td className="px-3 py-2 text-sm">20%</td>
                  <td className="px-3 py-2 text-sm">30%</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-sm">21-27</td>
                  <td className="px-3 py-2 text-sm">22%</td>
                  <td className="px-3 py-2 text-sm">32%</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-sm">28-39</td>
                  <td className="px-3 py-2 text-sm">24%</td>
                  <td className="px-3 py-2 text-sm">34%</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-sm">40+</td>
                  <td className="px-3 py-2 text-sm">26%</td>
                  <td className="px-3 py-2 text-sm">36%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
