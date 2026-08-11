"use client";

import { useTranslations } from "next-intl";
import { OutputDisplay, ResultGrid } from "@/components/converter";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  calculateSetCalculator,
  SET_OPERATIONS,
  type SetCalculatorInput,
  type SetCalculatorResult,
  type SetOperation,
} from "@/lib/converters/math/set-calculator";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  a: string;
  b: string;
  operation: SetOperation;
}

const useSetCalculatorStore = createCalculatorStore<FormValues, SetCalculatorResult>({
  name: "set-calculator",
  initialValues: { a: "1, 2, 3, 4", b: "3, 4, 5, 6", operation: "union" },
  calculate: (vals) => calculateSetCalculator(vals as SetCalculatorInput),
});

export function SetCalculatorComponent() {
  const t = useTranslations("converter.set-calculator");
  const { values, setValue, result } = useSetCalculatorStore();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="setA">{t("setA")}</Label>
        <textarea
          id="setA"
          value={values.a}
          onChange={(e) => setValue("a", e.target.value)}
          rows={3}
          className="w-full rounded-md border bg-background px-3 py-2 font-mono text-sm"
          placeholder="1, 2, 3"
        />
        <p className="text-xs text-muted-foreground">{t("hint")}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="setB">{t("setB")}</Label>
        <textarea
          id="setB"
          value={values.b}
          onChange={(e) => setValue("b", e.target.value)}
          rows={3}
          className="w-full rounded-md border bg-background px-3 py-2 font-mono text-sm"
          placeholder="3, 4, 5"
        />
      </div>

      <div className="space-y-2">
        <Label>{t("operation")}</Label>
        <Select
          value={values.operation}
          onValueChange={(o) => setValue("operation", o as SetOperation)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SET_OPERATIONS.map((op) => (
              <SelectItem key={op.value} value={op.value}>
                {op.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {result && (
        <div className="space-y-4">
          <ResultGrid
            results={[{ label: t("cardinality"), value: result.cardinality }]}
            columns={2}
          />
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="mb-2 text-sm font-medium">{t("resultSet")}</p>
            <p className="break-words font-mono text-sm">{result.display}</p>
          </div>
        </div>
      )}
    </div>
  );
}
