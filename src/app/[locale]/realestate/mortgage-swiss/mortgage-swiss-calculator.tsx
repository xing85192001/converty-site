"use client";

import { AlertTriangle, Building2, Info, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
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
import { CurrencySelector, formatCurrencyValue } from "@/components/converter/currency-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getSwissLoanTerms,
  getSwissMortgageRates,
} from "@/lib/converters/realestate/mortgage-swiss";
import { useSwissMortgageStore } from "@/stores/mortgage-swiss-store";

export function MortgageSwissCalculator() {
  const t = useTranslations("calculator.realestate.mortgage");
  const commonT = useTranslations("common");

  const {
    propertyPrice,
    downPayment,
    downPaymentPercent,
    loanTerm,
    interestRate,
    currency,
    startDate,
    result,
    setPropertyPrice,
    setDownPayment,
    setDownPaymentPercent,
    setLoanTerm,
    setInterestRate,
    setCurrency,
    setStartDate,
    calculate,
    reset,
  } = useSwissMortgageStore();

  const rates = getSwissMortgageRates();
  const loanTerms = getSwissLoanTerms();

  // Calculate on mount
  useEffect(() => {
    calculate();
  }, [calculate]);

  const formatCurrency = (value: number) => formatCurrencyValue(value, currency);

  const pieData = result
    ? [
        { name: t("principal"), value: result.loanAmount },
        { name: t("totalInterest"), value: result.totalInterest },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Swiss Requirements Info */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                {t("swissRequirementsTitle")}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {t("swissRequirementsDescription")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warnings */}
      {result?.warnings && result.warnings.length > 0 && (
        <Card className="bg-destructive/10 border-destructive/30">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-destructive mb-1">{t("warningsTitle")}</p>
                <ul className="list-disc pl-4 mt-2 text-sm space-y-1">
                  {result.warnings.map((warning) => (
                    <li key={warning} className="text-muted-foreground">
                      {t(warning)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Property Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {t("propertyDetails")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="propertyPrice">{t("propertyPrice")}</Label>
              <Input
                id="propertyPrice"
                type="number"
                value={propertyPrice}
                onChange={(e) => setPropertyPrice(Number(e.target.value) || 0)}
                min={0}
              />
            </div>
            <CurrencySelector value={currency} onChange={setCurrency} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="downPayment">{t("downPayment")}</Label>
              <Input
                id="downPayment"
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value) || 0)}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="downPaymentPercent">{t("downPaymentPercent")}</Label>
              <Input
                id="downPaymentPercent"
                type="number"
                value={downPaymentPercent.toFixed(1)}
                onChange={(e) => setDownPaymentPercent(Number(e.target.value) || 0)}
                min={0}
                max={100}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loan Details */}
      <Card>
        <CardHeader>
          <CardTitle>{t("loanDetails")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="loanTerm">{t("loanTerm")}</Label>
              <Select value={String(loanTerm)} onValueChange={(v) => setLoanTerm(Number(v))}>
                <SelectTrigger id="loanTerm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {loanTerms.map((term) => (
                    <SelectItem key={term} value={String(term)}>
                      {term} {t("years")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="interestRate">{t("interestRate")}</Label>
              <Input
                id="interestRate"
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value) || 0)}
                min={0}
                max={15}
                step={0.01}
              />
              <p className="text-xs text-muted-foreground">
                {t("currentRates")}: {t("fixed5y")} {rates.fixed5y}%, {t("fixed10y")}{" "}
                {rates.fixed10y}%
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">{t("startDate")}</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <>
          {/* Monthly Payment */}
          <Card>
            <CardHeader>
              <CardTitle>{t("monthlyPayment")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-6 bg-primary/10 rounded-lg mb-6">
                <p className="text-4xl font-bold text-primary">
                  {formatCurrency(result.monthlyPayment)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{t("perMonth")}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("loanAmount")}:</span>
                  <span className="font-medium">{formatCurrency(result.loanAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("ltv")}:</span>
                  <span className="font-medium">{result.ltv.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("totalInterest")}:</span>
                  <span className="font-medium">{formatCurrency(result.totalInterest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("totalCost")}:</span>
                  <span className="font-medium">{formatCurrency(result.totalCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("payoffDate")}:</span>
                  <span className="font-medium">{result.payoffDate}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Affordability Check */}
          <Card>
            <CardHeader>
              <CardTitle>{t("affordabilityCheck")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{t("affordabilityDescription")}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">{t("stressTestPayment")}</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(result.affordabilityCheck.monthlyHousingCost)}
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">{t("requiredIncome")}</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(result.affordabilityCheck.requiredGrossIncome)}
                  </p>
                  <p className="text-xs text-muted-foreground">{t("perYear")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Principal vs Interest Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>{t("principalVsInterest")}</CardTitle>
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

          {/* Balance Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>{t("balanceOverTime")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.yearlyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value ?? 0))}
                      labelFormatter={(label) => `${t("year")} ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="balance"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                      name={t("remainingBalance")}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Yearly Principal vs Interest */}
          <Card>
            <CardHeader>
              <CardTitle>{t("yearlyPrincipalVsInterest")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.yearlyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value ?? 0))}
                      labelFormatter={(label) => `${t("year")} ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="principal"
                      stackId="1"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.6}
                      name={t("principal")}
                    />
                    <Area
                      type="monotone"
                      dataKey="interest"
                      stackId="1"
                      stroke="hsl(var(--destructive))"
                      fill="hsl(var(--destructive))"
                      fillOpacity={0.6}
                      name={t("interest")}
                    />
                    <Legend />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Reset Button */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={reset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          {commonT("reset")}
        </Button>
      </div>
    </div>
  );
}
