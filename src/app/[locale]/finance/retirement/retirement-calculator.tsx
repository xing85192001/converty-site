"use client";

import { useFormatter, useTranslations } from "next-intl";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { InputField, ResultGrid } from "@/components/converter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  calculateRetirement,
  type RetirementInput,
  type RetirementResult,
} from "@/lib/converters/finance/retirement";
import { RetirementFormSchema } from "@/lib/schemas/finance";
import { createCalculatorStore } from "@/stores/calculator-store";

const useRetirementStore = createCalculatorStore<RetirementInput, RetirementResult>({
  name: "retirement-calculator",
  schema: RetirementFormSchema,
  initialValues: {
    currentAge: 30,
    retirementAge: 65,
    currentSavings: 50000,
    monthlyContribution: 1000,
    expectedReturn: 7,
    inflationRate: 2.5,
    desiredAnnualIncome: 60000,
    socialSecurityBenefit: 2000,
    lifeExpectancy: 90,
  },
  calculate: calculateRetirement,
});

export function RetirementCalculator() {
  const t = useTranslations("calculator");
  const format = useFormatter();
  const { values, setValue, result, errors, calculationError } = useRetirementStore();

  const formatCurrency = (value: number) => {
    return format.number(value, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const formatCompact = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("finance.personalInformation")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField
              id="currentAge"
              label={t("finance.currentAge")}
              type="number"
              value={values.currentAge.toString()}
              onChange={(value) => setValue("currentAge", Number.parseFloat(value) || 0)}
              min={18}
              max={80}
              error={errors.currentAge}
            />
            <InputField
              id="retirementAge"
              label={t("finance.retirementAge")}
              type="number"
              value={values.retirementAge.toString()}
              onChange={(value) => setValue("retirementAge", Number.parseFloat(value) || 0)}
              min={50}
              max={100}
              error={errors.retirementAge}
            />
            <InputField
              id="lifeExpectancy"
              label={t("finance.lifeExpectancy")}
              type="number"
              value={values.lifeExpectancy.toString()}
              onChange={(value) => setValue("lifeExpectancy", Number.parseFloat(value) || 0)}
              min={70}
              max={120}
              error={errors.lifeExpectancy}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("finance.savingsContributions")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              id="currentSavings"
              label={t("finance.currentRetirementSavings")}
              type="number"
              value={values.currentSavings.toString()}
              onChange={(value) => setValue("currentSavings", Number.parseFloat(value) || 0)}
              min={0}
              error={errors.currentSavings}
            />
            <InputField
              id="monthlyContribution"
              label={t("finance.monthlyContribution")}
              type="number"
              value={values.monthlyContribution.toString()}
              onChange={(value) => setValue("monthlyContribution", Number.parseFloat(value) || 0)}
              min={0}
              error={errors.monthlyContribution}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("finance.returnsIncome")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              id="expectedReturn"
              label={t("finance.expectedAnnualReturn")}
              type="number"
              value={values.expectedReturn.toString()}
              onChange={(value) => setValue("expectedReturn", Number.parseFloat(value) || 0)}
              min={0}
              max={20}
              error={errors.expectedReturn}
            />
            <InputField
              id="inflationRate"
              label={t("finance.expectedInflation")}
              type="number"
              value={values.inflationRate.toString()}
              onChange={(value) => setValue("inflationRate", Number.parseFloat(value) || 0)}
              min={0}
              max={10}
              error={errors.inflationRate}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              id="desiredAnnualIncome"
              label={t("finance.desiredAnnualIncome")}
              type="number"
              value={values.desiredAnnualIncome.toString()}
              onChange={(value) => setValue("desiredAnnualIncome", Number.parseFloat(value) || 0)}
              min={0}
              error={errors.desiredAnnualIncome}
            />
            <InputField
              id="socialSecurityBenefit"
              label={t("finance.expectedSocialSecurity")}
              type="number"
              value={values.socialSecurityBenefit.toString()}
              onChange={(value) => setValue("socialSecurityBenefit", Number.parseFloat(value) || 0)}
              min={0}
              error={errors.socialSecurityBenefit}
            />
          </div>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("finance.retirementProjection")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <p className="text-4xl font-bold text-primary">
                  {formatCurrency(result.retirementSavings)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("finance.projectedSavingsAtRetirement")}
                </p>
              </div>

              {result.hasSufficientFunds ? (
                <div className="p-4 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-lg text-center">
                  {t("finance.onTrackMessage")}
                </div>
              ) : (
                <div className="p-4 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-lg text-center">
                  {t("finance.considerIncreasingContributions")} {formatCurrency(result.savingsGap)}
                </div>
              )}

              <ResultGrid
                results={[
                  {
                    label: t("finance.totalContributions"),
                    value: formatCurrency(result.totalContributions),
                  },
                  { label: t("finance.totalGrowth"), value: formatCurrency(result.totalGrowth) },
                  {
                    label: t("finance.inflationAdjustedValue"),
                    value: formatCurrency(result.inflationAdjustedSavings),
                  },
                  { label: t("finance.yearsInRetirement"), value: result.yearsInRetirement },
                  {
                    label: t("finance.monthlyRetirementIncome"),
                    value: formatCurrency(result.monthlyRetirementIncome),
                  },
                ]}
                columns={2}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("finance.savingsGrowthOverTime")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.projections}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="age" tickFormatter={(v) => `${t("labels.age")} ${v}`} />
                    <YAxis tickFormatter={(value) => formatCompact(value)} />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value ?? 0))}
                      labelFormatter={(label) => `${t("labels.age")} ${label}`}
                    />
                    <ReferenceLine
                      x={values.retirementAge}
                      stroke="hsl(var(--destructive))"
                      strokeDasharray="3 3"
                      label={{ value: t("finance.retirement"), position: "top" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="savings"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                      name={t("finance.totalSavings")}
                    />
                    <Legend />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("finance.accumulationPhaseDetails")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">{t("labels.age")}</th>
                      <th className="text-right py-2 px-2">{t("finance.contributions")}</th>
                      <th className="text-right py-2 px-2">{t("finance.growth")}</th>
                      <th className="text-right py-2 px-2">{t("finance.balance")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.projections
                      .filter((p) => p.phase === "accumulation")
                      .slice(0, 20)
                      .map((row) => (
                        <tr key={row.age} className="border-b">
                          <td className="py-2 px-2">{row.age}</td>
                          <td className="text-right py-2 px-2">
                            {formatCurrency(row.contribution)}
                          </td>
                          <td className="text-right py-2 px-2">{formatCurrency(row.growth)}</td>
                          <td className="text-right py-2 px-2 font-medium">
                            {formatCurrency(row.savings)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {result.projections.filter((p) => p.phase === "accumulation").length > 20 && (
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    {t("finance.showingFirst20Years")}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
