"use client";

import { ArrowLeftRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { InputField, OutputDisplay } from "@/components/converter";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  calculateUnitConverter,
  UNIT_CATEGORIES,
  UNIT_CATEGORY_ORDER,
  type UnitCategory,
  type UnitConverterInput,
  type UnitConverterResult,
} from "@/lib/converters/math/unit-converter";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  category: UnitCategory;
  value: number;
  from: string;
  to: string;
}

const DEFAULTS: Record<UnitCategory, [string, string]> = {
  length: ["m", "km"],
  mass: ["kg", "lb"],
  temperature: ["c", "f"],
  area: ["m2", "ft2"],
  volume: ["l", "gal"],
  speed: ["kmh", "mph"],
  time: ["h", "min"],
  data: ["MB", "MiB"],
  energy: ["J", "kWh"],
  power: ["W", "hp"],
  pressure: ["Pa", "psi"],
};

function defaultsFor(cat: UnitCategory): FormValues {
  const [from, to] = DEFAULTS[cat];
  return { category: cat, value: 1, from, to };
}

const useUnitConverterStore = createCalculatorStore<FormValues, UnitConverterResult>({
  name: "unit-converter",
  initialValues: defaultsFor("length"),
  calculate: (vals) => calculateUnitConverter(vals as UnitConverterInput),
});

export function UnitConverterComponent() {
  const t = useTranslations("converter.unit-converter");
  const { values, setValue, setValues, result } = useUnitConverterStore();

  const category = UNIT_CATEGORIES[values.category];
  const options = category.units.map((u) => ({ value: u.value, label: u.label }));

  function changeCategory(next: string) {
    const cat = next as UnitCategory;
    const [from, to] = DEFAULTS[cat];
    setValues({ ...values, category: cat, from, to });
  }

  function swap() {
    setValues({ ...values, from: values.to, to: values.from });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>{t("category")}</Label>
        <Select value={values.category} onValueChange={changeCategory}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {UNIT_CATEGORY_ORDER.map((c) => (
              <SelectItem key={c} value={c}>
                {UNIT_CATEGORIES[c].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <InputField
        id="value"
        label={t("value")}
        type="number"
        value={values.value}
        onChange={(v) => setValue("value", Number(v))}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("from")}</Label>
          <Select value={values.from} onValueChange={(u) => setValue("from", u)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t("to")}</Label>
          <div className="flex gap-2">
            <Select value={values.to} onValueChange={(u) => setValue("to", u)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={swap} aria-label={t("swap")}>
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {result && (
        <OutputDisplay
          label={`${result.fromLabel} → ${result.toLabel}`}
          value={result.formatted}
          size="lg"
        />
      )}
    </div>
  );
}
