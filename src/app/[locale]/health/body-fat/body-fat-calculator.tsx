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
  type BodyFatInput,
  type BodyFatResult,
  calculateBodyFat,
} from "@/lib/converters/health/body-fat";
import { BodyFatFormSchema } from "@/lib/schemas/health";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  gender: "male" | "female";
  age: string;
  weight: string;
  height: string;
  neck: string;
  waist: string;
  hip: string;
}

const useStore = createCalculatorStore<FormValues, BodyFatResult | null>({
  name: "body-fat-calculator",
  initialValues: {
    gender: "male",
    age: "30",
    weight: "80",
    height: "175",
    neck: "38",
    waist: "85",
    hip: "95",
  },
  schema: BodyFatFormSchema,
  calculate: (vals) => {
    const input: BodyFatInput = {
      gender: vals.gender,
      age: parseFloat(vals.age) || 0,
      weight: parseFloat(vals.weight) || 0,
      height: parseFloat(vals.height) || 0,
      neck: parseFloat(vals.neck) || 0,
      waist: parseFloat(vals.waist) || 0,
      hip: vals.gender === "female" ? parseFloat(vals.hip) || 0 : undefined,
    };
    return calculateBodyFat(input);
  },
});

export function BodyFatCalculator() {
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

        <InputField
          id="neck"
          label={t("neck")}
          value={values.neck}
          onChange={(v) => setValue("neck", v)}
          error={errors.neck}
          min={0}
          step="0.1"
          placeholder="38"
        />

        <InputField
          id="waist"
          label={t("waist")}
          value={values.waist}
          onChange={(v) => setValue("waist", v)}
          error={errors.waist}
          min={0}
          step="0.1"
          placeholder="85"
        />

        {values.gender === "female" && (
          <InputField
            id="hip"
            label={t("hip")}
            value={values.hip}
            onChange={(v) => setValue("hip", v)}
            error={errors.hip}
            min={0}
            step="0.1"
            placeholder="95"
          />
        )}
      </div>

      {result && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <OutputDisplay
              label={tResults("bodyFatPercentage")}
              value={result.bodyFatPercent.toFixed(1)}
              unit="%"
              size="lg"
              className="flex-1"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                {tResults("category")}
              </p>
              <div className="rounded-md border bg-muted/50 px-3 py-4">
                <span className="text-2xl font-bold">{tResults(result.category)}</span>
              </div>
            </div>
          </div>

          <ResultGrid
            results={[
              {
                label: tResults("fatMass"),
                value: result.fatMass.toFixed(1),
                unit: "kg",
              },
              {
                label: tResults("leanMass"),
                value: result.leanMass.toFixed(1),
                unit: "kg",
              },
            ]}
          />
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
