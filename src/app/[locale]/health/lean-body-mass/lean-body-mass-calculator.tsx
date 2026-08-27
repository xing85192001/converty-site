"use client";

import { useTranslations } from "next-intl";
import { InputField, ResultGrid } from "@/components/converter";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  calculateLeanBodyMass,
  type LeanBodyMassInput,
  type LeanBodyMassResult,
} from "@/lib/converters/health/lean-body-mass";
import { LeanBodyMassFormSchema } from "@/lib/schemas/health";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  gender: "male" | "female";
  weight: string;
  height: string;
}

const useStore = createCalculatorStore<FormValues, LeanBodyMassResult | null>({
  name: "lean-body-mass-calculator",
  initialValues: {
    gender: "male",
    weight: "80",
    height: "175",
  },
  schema: LeanBodyMassFormSchema,
  calculate: (vals) => {
    const input: LeanBodyMassInput = {
      gender: vals.gender,
      weight: parseFloat(vals.weight) || 0,
      height: parseFloat(vals.height) || 0,
    };
    return calculateLeanBodyMass(input);
  },
});

export function LeanBodyMassCalculator() {
  const t = useTranslations("calculator.labels");
  const tResults = useTranslations("calculator.results");

  const { values, setValue, result, errors, calculationError } = useStore();

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
          error={errors.weight}
          min={0}
          step="0.1"
          placeholder="80"
        />

        <InputField
          id="height"
          label={t("height")}
          value={values.height}
          onChange={(v) => setValue("height", v)}
          error={errors.height}
          min={0}
          step="0.1"
          placeholder="175"
        />
      </div>

      {result && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{tResults("leanMass")} (Multiple Formulas)</h3>
          <ResultGrid
            results={[
              {
                label: "Boer Formula",
                value: result.boerFormula.toFixed(1),
                unit: "kg",
              },
              {
                label: "James Formula",
                value: result.jamesFormula.toFixed(1),
                unit: "kg",
              },
              {
                label: "Hume Formula",
                value: result.humeFormula.toFixed(1),
                unit: "kg",
              },
              {
                label: tResults("average"),
                value: result.average.toFixed(1),
                unit: "kg",
              },
              {
                label: `${tResults("bodyFatPercentage")} (estimated)`,
                value: result.bodyFatPercentEstimate.toFixed(1),
                unit: "%",
              },
            ]}
          />
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
