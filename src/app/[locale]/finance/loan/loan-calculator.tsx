"use client";

import { useFormatter, useTranslations } from "next-intl";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { InputField, ResultGrid } from "@/components/converter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateLoan, type LoanInput, type LoanResult } from "@/lib/converters/finance/loan";
import { LoanFormSchema } from "@/lib/schemas/finance";
import { createCalculatorStore } from "@/stores/calculator-store";

const useLoanStore = createCalculatorStore<LoanInput, LoanResult>({
  name: "loan-calculator",
  schema: LoanFormSchema,
  initialValues: {
    loanAmount: 25000,
    interestRate: 8.5,
    loanTerm: 60,
    startDate: new Date().toISOString().split("T")[0],
  },
  calculate: calculateLoan,
});

export function LoanCalculator() {
  const t = useTranslations("calculator");
  const format = useFormatter();
  const { values, setValue, result, errors, calculationError } = useLoanStore();

  const formatCurrency = (value: number) => {
    return format.number(value, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const pieData = result
    ? [
        { name: t("labels.principal"), value: values.loanAmount },
        { name: t("labels.interest"), value: result.totalInterest },
      ]
    : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("finance.loanDetails")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InputField
            id="loanAmount"
            label={t("finance.loanAmount")}
            type="number"
            value={values.loanAmount.toString()}
            onChange={(value) => setValue("loanAmount", Number.parseFloat(value) || 0)}
            min={0}
            error={errors.loanAmount}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              id="interestRate"
              label={t("finance.annualInterestRate")}
              type="number"
              value={values.interestRate.toString()}
              onChange={(value) => setValue("interestRate", Number.parseFloat(value) || 0)}
              min={0}
              max={50}
              error={errors.interestRate}
            />
            <InputField
              id="loanTerm"
              label={t("finance.loanTermMonths")}
              type="number"
              value={values.loanTerm.toString()}
              onChange={(value) => setValue("loanTerm", Number.parseFloat(value) || 0)}
              min={1}
              max={360}
              error={errors.loanTerm}
            />
          </div>

          <InputField
            id="startDate"
            label={t("labels.startDate")}
            type="date"
            value={values.startDate}
            onChange={(value) => setValue("startDate", value)}
          />
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("finance.monthlyPayment")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <p className="text-4xl font-bold text-primary">
                  {formatCurrency(result.monthlyPayment)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{t("finance.perMonth")}</p>
              </div>

              <ResultGrid
                results={[
                  { label: t("finance.loanAmount"), value: formatCurrency(values.loanAmount) },
                  {
                    label: t("finance.totalInterest"),
                    value: formatCurrency(result.totalInterest),
                  },
                  { label: t("finance.totalPayment"), value: formatCurrency(result.totalPayment) },
                  { label: t("labels.payoffDate"), value: result.payoffDate },
                  {
                    label: t("labels.effectiveRate"),
                    value: `${result.effectiveRate.toFixed(2)}%`,
                  },
                ]}
                columns={2}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("labels.principal")} vs {t("labels.interest")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    >
                      <Cell fill="hsl(var(--primary))" />
                      <Cell fill="hsl(var(--destructive))" />
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("labels.balanceOverTime")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.yearlyTotals}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value ?? 0))}
                      labelFormatter={(label) => `${t("labels.year")} ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="balance"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                      name={t("labels.remainingBalance")}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("labels.yearlyPrincipalVsInterest")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.yearlyTotals}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
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
                      fillOpacity={0.6}
                      name={t("labels.principal")}
                    />
                    <Area
                      type="monotone"
                      dataKey="interest"
                      stackId="1"
                      stroke="hsl(var(--destructive))"
                      fill="hsl(var(--destructive))"
                      fillOpacity={0.6}
                      name={t("labels.interest")}
                    />
                    <Legend />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
