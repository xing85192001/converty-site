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
  calculateIncomeTax,
  type IncomeTaxInput,
  type IncomeTaxResult,
  TAX_PRESET_OPTIONS,
  type TaxPreset,
} from "@/lib/converters/finance/income-tax";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  system: TaxPreset;
  income: number;
  bracketsText: string;
}

const useIncomeTaxStore = createCalculatorStore<FormValues, IncomeTaxResult>({
  name: "income-tax",
  initialValues: {
    system: "us",
    income: 75000,
    bracketsText: "10000, 0\n40000, 15\n80000, 25\n0, 35",
  },
  calculate: (vals) => calculateIncomeTax(vals as IncomeTaxInput),
});

export function IncomeTaxComponent() {
  const t = useTranslations("converter.income-tax");
  const { values, setValue, result } = useIncomeTaxStore();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>{t("system")}</Label>
        <Select value={values.system} onValueChange={(s) => setValue("system", s as TaxPreset)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TAX_PRESET_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <InputField
        id="income"
        label={t("income")}
        type="number"
        value={values.income}
        onChange={(v) => setValue("income", Number(v))}
      />

      {values.system === "custom" && (
        <div className="space-y-2">
          <Label htmlFor="brackets">{t("brackets")}</Label>
          <textarea
            id="brackets"
            value={values.bracketsText}
            onChange={(e) => setValue("bracketsText", e.target.value)}
            rows={4}
            className="w-full rounded-md border bg-background px-3 py-2 font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">{t("hint")}</p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <ResultGrid
            results={[
              {
                label: t("tax"),
                value: "$" + result.tax.toLocaleString("en-US", { maximumFractionDigits: 2 }),
              },
              { label: t("effectiveRate"), value: (result.effectiveRate * 100).toFixed(2) + "%" },
              { label: t("marginalRate"), value: (result.marginalRate * 100).toFixed(2) + "%" },
              {
                label: t("net"),
                value: "$" + result.net.toLocaleString("en-US", { maximumFractionDigits: 2 }),
              },
            ]}
            columns={2}
          />
          <div className="space-y-1 rounded-lg border bg-muted/50 p-4">
            <p className="mb-1 text-sm font-medium">{t("breakdown")}</p>
            {result.breakdown.map((b, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{b.bracket}</span>
                <span className="font-mono">
                  ${b.tax.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
