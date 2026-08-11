"use client";

import { useFormatter, useTranslations } from "next-intl";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { InputField, ResultGrid } from "@/components/converter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  COMPOUND_FREQUENCIES,
  type CompoundFrequency,
  type CompoundInterestInput,
  type CompoundInterestResult,
  calculateCompoundInterest,
} from "@/lib/converters/finance/compound-interest";
import { CompoundInterestFormSchema } from "@/lib/schemas/finance";
import { createCalculatorStore } from "@/stores/calculator-store";

const useCompoundInterestStore = createCalculatorStore<
  CompoundInterestInput,
  CompoundInterestResult
>({
  name: "compound-interest-calculator",
  schema: CompoundInterestFormSchema,
  initialValues: {
    principal: 10000,
    interestRate: 7,
    years: 10,
    compoundFrequency: "monthly" as CompoundFrequency,
    monthlyContribution: 500,
    contributionTiming: "end" as const,
  },
  calculate: calculateCompoundInterest,
});

export function CompoundInterestCalculator() {
  const t = useTranslations("calculator");
  const format = useFormatter();
  const { values, setValue, result, errors, calculationError } = useCompoundInterestStore();

  const formatCurrency = (value: number) => {
    return format.number(value, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("finance.investmentDetails")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              id="principal"
              label={t("finance.initialInvestment")}
              type="number"
              value={values.principal.toString()}
              onChange={(value) => setValue("principal", Number.parseFloat(value) || 0)}
              min={0}
              error={errors.principal}
            />
            <InputField
              id="interestRate"
              label={t("finance.annualInterestRate")}
              type="number"
              value={values.interestRate.toString()}
              onChange={(value) => setValue("interestRate", Number.parseFloat(value) || 0)}
              min={0}
              max={100}
              error={errors.interestRate}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              id="years"
              label={t("finance.investmentPeriod")}
              type="number"
              value={values.years.toString()}
              onChange={(value) => setValue("years", Number.parseFloat(value) || 0)}
              min={1}
              max={100}
              error={errors.years}
            />
            <div className="space-y-2">
              <Label>{t("finance.compoundFrequency")}</Label>
              <Select
                value={values.compoundFrequency}
                onValueChange={(value) => setValue("compoundFrequency", value as CompoundFrequency)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMPOUND_FREQUENCIES.map((freq) => (
                    <SelectItem key={freq} value={freq}>
                      {t(`finance.${freq}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("finance.regularContributions")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              id="monthlyContribution"
              label={t("finance.monthlyContribution")}
              type="number"
              value={values.monthlyContribution.toString()}
              onChange={(value) => setValue("monthlyContribution", Number.parseFloat(value) || 0)}
              min={0}
              error={errors.monthlyContribution}
            />
            <div className="space-y-2">
              <Label>{t("finance.contributionTiming")}</Label>
              <Select
                value={values.contributionTiming}
                onValueChange={(value) =>
                  setValue("contributionTiming", value as "beginning" | "end")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginning">{t("finance.beginningOfMonth")}</SelectItem>
                  <SelectItem value="end">{t("finance.endOfMonth")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("labels.results")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <p className="text-4xl font-bold text-primary">
                  {formatCurrency(result.finalBalance)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{t("finance.finalBalance")}</p>
              </div>

              <ResultGrid
                results={[
                  {
                    label: t("finance.initialInvestment"),
                    value: formatCurrency(result.totalPrincipal),
                  },
                  {
                    label: t("finance.totalContributions"),
                    value: formatCurrency(result.totalContributions),
                  },
                  {
                    label: t("finance.totalInterestEarned"),
                    value: formatCurrency(result.totalInterest),
                  },
                  {
                    label: t("finance.effectiveAnnualRate"),
                    value: `${result.effectiveAnnualRate.toFixed(2)}%`,
                  },
                ]}
                columns={2}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("finance.growthOverTime")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.yearlyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" tickFormatter={(v) => `${t("labels.year")} ${v}`} />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value ?? 0))}
                      labelFormatter={(label) => `${t("labels.year")} ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="principal"
                      stackId="1"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.8}
                      name={t("finance.initialInvestment")}
                    />
                    <Area
                      type="monotone"
                      dataKey="contributions"
                      stackId="1"
                      stroke="hsl(var(--chart-2))"
                      fill="hsl(var(--chart-2))"
                      fillOpacity={0.6}
                      name={t("finance.contributions")}
                    />
                    <Area
                      type="monotone"
                      dataKey="interest"
                      stackId="1"
                      stroke="hsl(var(--chart-3))"
                      fill="hsl(var(--chart-3))"
                      fillOpacity={0.6}
                      name={t("labels.interest")}
                    />
                    <Legend />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("finance.balanceGrowthByYear")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={result.yearlyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" tickFormatter={(v) => `Y${v}`} />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value ?? 0))}
                      labelFormatter={(label) => `${t("labels.year")} ${label}`}
                    />
                    <Bar dataKey="balance" fill="hsl(var(--primary))" name={t("labels.balance")} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("finance.yearByYearBreakdown")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">{t("labels.year")}</th>
                      <th className="text-right py-2 px-2">{t("finance.contributions")}</th>
                      <th className="text-right py-2 px-2">{t("labels.interest")}</th>
                      <th className="text-right py-2 px-2">{t("labels.balance")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.yearlyBreakdown.map((row) => (
                      <tr key={row.year} className="border-b">
                        <td className="py-2 px-2">{row.year}</td>
                        <td className="text-right py-2 px-2">
                          {formatCurrency(row.contributions)}
                        </td>
                        <td className="text-right py-2 px-2">{formatCurrency(row.interest)}</td>
                        <td className="text-right py-2 px-2 font-medium">
                          {formatCurrency(row.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
