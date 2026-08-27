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
import {
  calculateMortgage,
  type MortgageInput,
  type MortgageResult,
} from "@/lib/converters/finance/mortgage";
import { MortgageFormSchema } from "@/lib/schemas/finance";
import { createCalculatorStore } from "@/stores/calculator-store";

const useMortgageStore = createCalculatorStore<MortgageInput, MortgageResult>({
  name: "mortgage-calculator",
  schema: MortgageFormSchema,
  initialValues: {
    homePrice: 400000,
    downPayment: 80000,
    downPaymentPercent: 20,
    loanTerm: 30,
    interestRate: 6.5,
    propertyTax: 4800,
    homeInsurance: 1200,
    pmi: 0,
    hoaFees: 0,
    startDate: new Date().toISOString().split("T")[0],
  },
  calculate: calculateMortgage,
});

const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))", "hsl(var(--muted-foreground))"];

export function MortgageCalculator() {
  const t = useTranslations("calculator");
  const format = useFormatter();
  const { values, setValue, result, errors, calculationError } = useMortgageStore();

  const formatCurrency = (value: number) => {
    return format.number(value, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const handleDownPaymentChange = (value: string) => {
    const amount = Number.parseFloat(value) || 0;
    setValue("downPayment", amount);
    if (values.homePrice > 0) {
      setValue("downPaymentPercent", (amount / values.homePrice) * 100);
    }
  };

  const handleDownPaymentPercentChange = (value: string) => {
    const percent = Number.parseFloat(value) || 0;
    setValue("downPaymentPercent", percent);
    setValue("downPayment", (percent / 100) * values.homePrice);
  };

  const handleHomePriceChange = (value: string) => {
    const price = Number.parseFloat(value) || 0;
    setValue("homePrice", price);
    setValue("downPayment", (values.downPaymentPercent / 100) * price);
  };

  const pieData = result
    ? [
        { name: t("labels.principal"), value: result.loanAmount },
        { name: t("labels.interest"), value: result.totalInterest },
      ]
    : [];

  const monthlyPieData = result
    ? [
        { name: t("finance.principalAndInterest"), value: result.monthlyPrincipalInterest },
        { name: t("finance.propertyTax"), value: result.monthlyPropertyTax },
        { name: t("finance.insurance"), value: result.monthlyInsurance },
        ...(result.monthlyPmi > 0 ? [{ name: t("finance.pmi"), value: result.monthlyPmi }] : []),
        ...(result.monthlyHoa > 0
          ? [{ name: t("finance.hoaFees"), value: result.monthlyHoa }]
          : []),
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
            id="homePrice"
            label={t("finance.homePrice")}
            type="number"
            value={values.homePrice.toString()}
            onChange={handleHomePriceChange}
            min={0}
            error={errors.homePrice}
          />

          <div className="grid grid-cols-2 gap-4">
            <InputField
              id="downPayment"
              label={t("finance.downPaymentDollar")}
              type="number"
              value={values.downPayment.toString()}
              onChange={handleDownPaymentChange}
              min={0}
              error={errors.downPayment}
            />
            <InputField
              id="downPaymentPercent"
              label={t("finance.downPaymentPercent")}
              type="number"
              value={values.downPaymentPercent.toFixed(1)}
              onChange={handleDownPaymentPercentChange}
              min={0}
              max={100}
              error={errors.downPaymentPercent}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField
              id="loanTerm"
              label={t("finance.loanTermYears")}
              type="number"
              value={values.loanTerm.toString()}
              onChange={(value) => setValue("loanTerm", Number.parseFloat(value) || 0)}
              min={1}
              max={50}
              error={errors.loanTerm}
            />
            <InputField
              id="interestRate"
              label={t("finance.interestRatePercent")}
              type="number"
              value={values.interestRate.toString()}
              onChange={(value) => setValue("interestRate", Number.parseFloat(value) || 0)}
              min={0}
              max={30}
              error={errors.interestRate}
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("finance.additionalCosts")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              id="propertyTax"
              label={t("finance.propertyTaxAnnual")}
              type="number"
              value={values.propertyTax.toString()}
              onChange={(value) => setValue("propertyTax", Number.parseFloat(value) || 0)}
              min={0}
              error={errors.propertyTax}
            />
            <InputField
              id="homeInsurance"
              label={t("finance.homeInsuranceAnnual")}
              type="number"
              value={values.homeInsurance.toString()}
              onChange={(value) => setValue("homeInsurance", Number.parseFloat(value) || 0)}
              min={0}
              error={errors.homeInsurance}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField
              id="pmi"
              label={t("finance.pmiMonthly")}
              type="number"
              value={values.pmi.toString()}
              onChange={(value) => setValue("pmi", Number.parseFloat(value) || 0)}
              min={0}
              error={errors.pmi}
            />
            <InputField
              id="hoaFees"
              label={t("finance.hoaFeesMonthly")}
              type="number"
              value={values.hoaFees.toString()}
              onChange={(value) => setValue("hoaFees", Number.parseFloat(value) || 0)}
              min={0}
              error={errors.hoaFees}
            />
          </div>
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
                  {formatCurrency(result.totalMonthlyPayment)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{t("finance.perMonth")}</p>
              </div>

              <ResultGrid
                results={[
                  {
                    label: t("finance.principalAndInterest"),
                    value: formatCurrency(result.monthlyPrincipalInterest),
                  },
                  {
                    label: t("finance.propertyTax"),
                    value: formatCurrency(result.monthlyPropertyTax),
                  },
                  { label: t("finance.insurance"), value: formatCurrency(result.monthlyInsurance) },
                  ...(result.monthlyPmi > 0
                    ? [{ label: t("finance.pmi"), value: formatCurrency(result.monthlyPmi) }]
                    : []),
                  ...(result.monthlyHoa > 0
                    ? [{ label: t("finance.hoaFees"), value: formatCurrency(result.monthlyHoa) }]
                    : []),
                ]}
                columns={2}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("finance.monthlyPaymentBreakdown")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={monthlyPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    >
                      {monthlyPieData.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("finance.loanSummary")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResultGrid
                results={[
                  { label: t("finance.loanAmount"), value: formatCurrency(result.loanAmount) },
                  {
                    label: t("finance.totalInterest"),
                    value: formatCurrency(result.totalInterest),
                  },
                  {
                    label: t("finance.totalPayments"),
                    value: formatCurrency(result.totalPayments),
                  },
                  { label: t("finance.totalCost"), value: formatCurrency(result.totalCost) },
                  { label: t("labels.payoffDate"), value: result.payoffDate },
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
                  <AreaChart data={result.yearlyBreakdown}>
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
                  <AreaChart data={result.yearlyBreakdown}>
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
