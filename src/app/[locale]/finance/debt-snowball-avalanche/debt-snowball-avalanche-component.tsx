"use client";

import { useTranslations } from "next-intl";
import { InputField, ResultGrid } from "@/components/converter";
import { Label } from "@/components/ui/label";
import {
  calculateDebtPlanner,
  type DebtCalculatorResult,
  type DebtInput,
} from "@/lib/converters/finance/debt-snowball-avalanche";
import { createCalculatorStore } from "@/stores/calculator-store";

interface FormValues {
  debtsText: string;
  extra: number;
}

const useDebtPlannerStore = createCalculatorStore<FormValues, DebtCalculatorResult>({
  name: "debt-snowball-avalanche",
  initialValues: {
    debtsText:
      "Credit Card, 5000, 19.9, 100\nCar Loan, 12000, 6.5, 250\nStudent Loan, 8000, 4.5, 90",
    extra: 200,
  },
  calculate: (vals) => calculateDebtPlanner(vals as DebtInput),
});

function formatMoney(n: number): string {
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function DebtSnowballAvalancheComponent() {
  const t = useTranslations("converter.debt-snowball-avalanche");
  const { values, setValue, result } = useDebtPlannerStore();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="debts">{t("debts")}</Label>
        <textarea
          id="debts"
          value={values.debtsText}
          onChange={(e) => setValue("debtsText", e.target.value)}
          rows={5}
          className="w-full rounded-md border bg-background px-3 py-2 font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">{t("hint")}</p>
      </div>

      <InputField
        id="extra"
        label={t("extra")}
        type="number"
        value={values.extra}
        onChange={(v) => setValue("extra", Number(v))}
      />

      {result && (
        <div className="space-y-6">
          <div>
            <p className="mb-2 font-medium">{t("snowball")}</p>
            <ResultGrid
              results={[
                { label: t("months"), value: result.snowball.months },
                { label: t("totalInterest"), value: formatMoney(result.snowball.totalInterest) },
                { label: t("totalPaid"), value: formatMoney(result.snowball.totalPaid) },
              ]}
              columns={3}
            />
            <p className="mt-2 text-sm text-muted-foreground">
              {t("order")}: {result.snowball.order.join(" → ")}
            </p>
          </div>

          <div>
            <p className="mb-2 font-medium">{t("avalanche")}</p>
            <ResultGrid
              results={[
                { label: t("months"), value: result.avalanche.months },
                { label: t("totalInterest"), value: formatMoney(result.avalanche.totalInterest) },
                { label: t("totalPaid"), value: formatMoney(result.avalanche.totalPaid) },
              ]}
              columns={3}
            />
            <p className="mt-2 text-sm text-muted-foreground">
              {t("order")}: {result.avalanche.order.join(" → ")}
            </p>
          </div>

          <p className="rounded-lg border bg-muted/50 p-4 text-sm">
            {t("savings", {
              months: Math.abs(result.snowball.months - result.avalanche.months),
              interest: formatMoney(Math.abs(result.snowball.totalInterest - result.avalanche.totalInterest)),
            })}
          </p>
        </div>
      )}
    </div>
  );
}
