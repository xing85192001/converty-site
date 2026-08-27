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
  calculateGfr,
  type GfrInput,
  type GfrResult,
} from "@/lib/converters/health/gfr-calculator";
import { GfrFormSchema } from "@/lib/schemas/health";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  creatinine: string;
  creatinineUnit: "mgdl" | "umol";
  age: string;
  gender: "male" | "female";
  race: "black" | "other";
  weight: string;
}

const useStore = createCalculatorStore<FormValues, GfrResult | null>({
  name: "gfr-calculator",
  initialValues: {
    creatinine: "1.0",
    creatinineUnit: "mgdl",
    age: "45",
    gender: "male",
    race: "other",
    weight: "75",
  },
  schema: GfrFormSchema,
  calculate: (vals) => {
    const input: GfrInput = {
      creatinine: parseFloat(vals.creatinine) || 0,
      creatinineUnit: vals.creatinineUnit,
      age: parseInt(vals.age) || 0,
      gender: vals.gender,
      race: vals.race,
      weight: parseFloat(vals.weight) || undefined,
    };
    return calculateGfr(input);
  },
});

export function GfrCalculatorComponent() {
  const t = useTranslations("calculator.labels");
  const tResults = useTranslations("calculator.results");
  const tHealth = useTranslations("calculator.health");

  const { values, setValue, result, errors, calculationError } = useStore();

  const getStageColor = (stage: number) => {
    switch (stage) {
      case 1:
        return "bg-green-100 dark:bg-green-900";
      case 2:
        return "bg-lime-100 dark:bg-lime-900";
      case 3:
        return "bg-yellow-100 dark:bg-yellow-900";
      case 4:
        return "bg-orange-100 dark:bg-orange-900";
      case 5:
        return "bg-red-100 dark:bg-red-900";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          id="creatinine"
          label={t("creatinine")}
          value={values.creatinine}
          onChange={(v) => setValue("creatinine", v)}
          error={errors.creatinine}
          min={0}
          step="0.01"
          placeholder="1.0"
        />

        <div className="space-y-2">
          <Label>{t("creatinineUnit")}</Label>
          <Select
            value={values.creatinineUnit}
            onValueChange={(v) => setValue("creatinineUnit", v as "mgdl" | "umol")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mgdl">mg/dL</SelectItem>
              <SelectItem value="umol">µmol/L</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <InputField
          id="age"
          label={t("age")}
          value={values.age}
          onChange={(v) => setValue("age", v)}
          error={errors.age}
          min={18}
          max={120}
          step="1"
          placeholder="45"
        />

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
          placeholder="75"
        />
      </div>

      {result && (
        <div className="space-y-4">
          <OutputDisplay
            label={tResults("estimatedGFR")}
            value={Math.round(result.egfrCkdEpi)}
            unit="mL/min/1.73m²"
            size="lg"
          />

          <div className={`p-4 rounded-lg ${getStageColor(result.stage)}`}>
            <p className="font-semibold">{tHealth(`ckd.${result.stageKey}.description`)}</p>
            <p>{tHealth(`ckd.${result.stageKey}.kidneyFunction`)}</p>
            <p className="text-sm mt-2">{tHealth(`ckd.${result.stageKey}.recommendation`)}</p>
          </div>

          <h3 className="text-lg font-semibold">{tResults("gfrByFormula")}</h3>
          <ResultGrid
            results={[
              {
                label: "CKD-EPI (2021)",
                value: Math.round(result.egfrCkdEpi),
                unit: "mL/min/1.73m²",
              },
              {
                label: "MDRD",
                value: Math.round(result.egfrMdrd),
                unit: "mL/min/1.73m²",
              },
              ...(result.egfrCockcroftGault
                ? [
                    {
                      label: "Cockcroft-Gault",
                      value: Math.round(result.egfrCockcroftGault),
                      unit: "mL/min",
                    },
                  ]
                : []),
            ]}
          />

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">{tResults("ckdStages")}</h4>
            <ul className="space-y-1 text-sm">
              <li>{tHealth("ckd.reference.stage1")}</li>
              <li>{tHealth("ckd.reference.stage2")}</li>
              <li>{tHealth("ckd.reference.stage3a")}</li>
              <li>{tHealth("ckd.reference.stage3b")}</li>
              <li>{tHealth("ckd.reference.stage4")}</li>
              <li>{tHealth("ckd.reference.stage5")}</li>
            </ul>
          </div>
        </div>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
