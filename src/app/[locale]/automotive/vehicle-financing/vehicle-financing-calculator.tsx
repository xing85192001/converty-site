"use client";

import {
  ArrowLeftRight,
  Calculator,
  CreditCard,
  Key,
  RotateCcw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Currency } from "@/lib/converters/automotive/types";
import { SWISS_VAT_RATE } from "@/lib/converters/automotive/vehicle-financing";
import { type FinancingMode, useVehicleFinancingStore } from "@/stores/vehicle-financing-store";

export function VehicleFinancingCalculator() {
  const t = useTranslations("calculator.automotive.financing");
  const commonT = useTranslations("common");

  const {
    mode,
    vehiclePrice,
    downPayment,
    tradeInValue,
    currency,
    includeVAT,
    loanInterestRate,
    loanTermMonths,
    leaseTermMonths,
    residualPercent,
    leaseAPR,
    annualKmLimit,
    loanResult,
    leaseResult,
    comparisonResult,
    error,
    setMode,
    setVehiclePrice,
    setDownPayment,
    setTradeInValue,
    setCurrency,
    setIncludeVAT,
    setLoanInterestRate,
    setLoanTermMonths,
    setLeaseTermMonths,
    setResidualPercent,
    setLeaseAPR,
    setAnnualKmLimit,
    calculate,
    reset,
  } = useVehicleFinancingStore();

  // Calculate on mount
  useEffect(() => {
    calculate();
  }, [calculate]);

  const loanTermOptions = [24, 36, 48, 60, 72, 84];
  const leaseTermOptions = [24, 36, 48];
  const kmLimitOptions = [10000, 15000, 20000, 25000];

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <Tabs value={mode} onValueChange={(v) => setMode(v as FinancingMode)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="loan">
            <CreditCard className="h-4 w-4 mr-2" />
            {t("modes.loan")}
          </TabsTrigger>
          <TabsTrigger value="lease">
            <Key className="h-4 w-4 mr-2" />
            {t("modes.lease")}
          </TabsTrigger>
          <TabsTrigger value="compare">
            <ArrowLeftRight className="h-4 w-4 mr-2" />
            {t("modes.compare")}
          </TabsTrigger>
        </TabsList>

        {/* Vehicle & Common Inputs */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>{t("vehicleDetails")}</CardTitle>
            <CardDescription>{t("vehicleDetailsDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehiclePrice">{t("vehiclePrice")}</Label>
                <Input
                  id="vehiclePrice"
                  type="number"
                  min="0"
                  step="1000"
                  value={vehiclePrice}
                  onChange={(e) => setVehiclePrice(parseFloat(e.target.value) || 0)}
                  placeholder="40000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="downPayment">{t("downPayment")}</Label>
                <Input
                  id="downPayment"
                  type="number"
                  min="0"
                  step="500"
                  value={downPayment}
                  onChange={(e) => setDownPayment(parseFloat(e.target.value) || 0)}
                  placeholder="5000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tradeInValue">{t("tradeInValue")}</Label>
                <Input
                  id="tradeInValue"
                  type="number"
                  min="0"
                  step="500"
                  value={tradeInValue}
                  onChange={(e) => setTradeInValue(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">{t("currency")}</Label>
                <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CHF">{t("currencies.chf")}</SelectItem>
                    <SelectItem value="EUR">{t("currencies.eur")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch id="includeVAT" checked={includeVAT} onCheckedChange={setIncludeVAT} />
                <Label htmlFor="includeVAT">
                  {t("includeVAT")} ({SWISS_VAT_RATE}%)
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loan-specific inputs */}
        <TabsContent value="loan">
          <Card>
            <CardHeader>
              <CardTitle>{t("loanDetails")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="loanInterestRate">{t("interestRate")}</Label>
                  <Input
                    id="loanInterestRate"
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value={loanInterestRate}
                    onChange={(e) => setLoanInterestRate(parseFloat(e.target.value) || 0)}
                    placeholder="3.9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="loanTermMonths">{t("loanTerm")}</Label>
                  <Select
                    value={loanTermMonths.toString()}
                    onValueChange={(v) => setLoanTermMonths(parseInt(v))}
                  >
                    <SelectTrigger id="loanTermMonths">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {loanTermOptions.map((term) => (
                        <SelectItem key={term} value={term.toString()}>
                          {term} {t("months")} ({term / 12} {t("years")})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lease-specific inputs */}
        <TabsContent value="lease">
          <Card>
            <CardHeader>
              <CardTitle>{t("leaseDetails")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leaseTermMonths">{t("leaseTerm")}</Label>
                  <Select
                    value={leaseTermMonths.toString()}
                    onValueChange={(v) => setLeaseTermMonths(parseInt(v))}
                  >
                    <SelectTrigger id="leaseTermMonths">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {leaseTermOptions.map((term) => (
                        <SelectItem key={term} value={term.toString()}>
                          {term} {t("months")} ({term / 12} {t("years")})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="residualPercent">{t("residualValue")}</Label>
                  <Input
                    id="residualPercent"
                    type="number"
                    min="20"
                    max="70"
                    step="1"
                    value={residualPercent}
                    onChange={(e) => setResidualPercent(parseFloat(e.target.value) || 0)}
                    placeholder="50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leaseAPR">{t("leaseAPR")}</Label>
                  <Input
                    id="leaseAPR"
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value={leaseAPR}
                    onChange={(e) => setLeaseAPR(parseFloat(e.target.value) || 0)}
                    placeholder="3.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annualKmLimit">{t("annualKmLimit")}</Label>
                  <Select
                    value={annualKmLimit.toString()}
                    onValueChange={(v) => setAnnualKmLimit(parseInt(v))}
                  >
                    <SelectTrigger id="annualKmLimit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {kmLimitOptions.map((km) => (
                        <SelectItem key={km} value={km.toString()}>
                          {km.toLocaleString()} km/{t("year")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compare mode - show both inputs */}
        <TabsContent value="compare">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {t("loanDetails")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("interestRate")}</Label>
                  <Input
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value={loanInterestRate}
                    onChange={(e) => setLoanInterestRate(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("loanTerm")}</Label>
                  <Select
                    value={loanTermMonths.toString()}
                    onValueChange={(v) => setLoanTermMonths(parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {loanTermOptions.map((term) => (
                        <SelectItem key={term} value={term.toString()}>
                          {term} {t("months")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  {t("leaseDetails")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("leaseTerm")}</Label>
                  <Select
                    value={leaseTermMonths.toString()}
                    onValueChange={(v) => setLeaseTermMonths(parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {leaseTermOptions.map((term) => (
                        <SelectItem key={term} value={term.toString()}>
                          {term} {t("months")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("residualValue")} (%)</Label>
                  <Input
                    type="number"
                    min="20"
                    max="70"
                    value={residualPercent}
                    onChange={(e) => setResidualPercent(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loan Results */}
      {mode === "loan" && loanResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              {t("loanResult")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Monthly Payment Highlight */}
            <div className="text-center p-6 bg-muted rounded-lg">
              <div className="text-4xl font-bold">{loanResult.formatted.monthlyPayment}</div>
              <div className="text-muted-foreground">{t("perMonth")}</div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-muted rounded-md">
                <div className="text-sm text-muted-foreground">{t("loanAmount")}</div>
                <div className="text-lg font-semibold">{loanResult.formatted.loanAmount}</div>
              </div>
              <div className="p-4 bg-muted rounded-md">
                <div className="text-sm text-muted-foreground">{t("totalPayments")}</div>
                <div className="text-lg font-semibold">{loanResult.formatted.totalPayments}</div>
              </div>
              <div className="p-4 bg-muted rounded-md">
                <div className="text-sm text-muted-foreground">{t("totalInterest")}</div>
                <div className="text-lg font-semibold">{loanResult.formatted.totalInterest}</div>
              </div>
              <div className="p-4 bg-muted rounded-md">
                <div className="text-sm text-muted-foreground">{t("totalCost")}</div>
                <div className="text-lg font-semibold">{loanResult.formatted.totalCost}</div>
              </div>
            </div>

            {/* Amortization Schedule (first 12 months) */}
            <div className="space-y-2">
              <Label>{t("amortizationSchedule")}</Label>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("month")}</TableHead>
                      <TableHead className="text-right">{t("payment")}</TableHead>
                      <TableHead className="text-right">{t("principal")}</TableHead>
                      <TableHead className="text-right">{t("interest")}</TableHead>
                      <TableHead className="text-right">{t("balance")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loanResult.amortization.slice(0, 12).map((entry) => (
                      <TableRow key={entry.month}>
                        <TableCell>{entry.month}</TableCell>
                        <TableCell className="text-right">
                          {currency} {entry.payment.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {currency} {entry.principal.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {currency} {entry.interest.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {currency} {entry.balance.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="text-sm text-muted-foreground">{t("showingFirst12Months")}</p>
            </div>

            {/* Calculation Steps */}
            <div className="space-y-2">
              <Label>{t("calculationSteps")}</Label>
              <div className="p-4 bg-muted rounded-md text-sm space-y-1">
                {loanResult.steps.map((step, i) => (
                  <div key={`loan-step-${i}-${step.slice(0, 20)}`} className="font-mono">
                    {i + 1}. {step}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lease Results */}
      {mode === "lease" && leaseResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              {t("leaseResult")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Monthly Payment Highlight */}
            <div className="text-center p-6 bg-muted rounded-lg">
              <div className="text-4xl font-bold">{leaseResult.formatted.monthlyPayment}</div>
              <div className="text-muted-foreground">{t("perMonth")}</div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-md">
                <div className="text-sm text-muted-foreground">{t("capitalizedCost")}</div>
                <div className="text-lg font-semibold">{leaseResult.formatted.capitalizedCost}</div>
              </div>
              <div className="p-4 bg-muted rounded-md">
                <div className="text-sm text-muted-foreground">{t("residualValue")}</div>
                <div className="text-lg font-semibold">{leaseResult.formatted.residualValue}</div>
              </div>
              <div className="p-4 bg-muted rounded-md">
                <div className="text-sm text-muted-foreground">{t("totalCost")}</div>
                <div className="text-lg font-semibold">{leaseResult.formatted.totalCost}</div>
              </div>
            </div>

            {/* Payment Breakdown */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-md">
                <div className="text-sm text-muted-foreground">{t("depreciation")}</div>
                <div className="text-lg font-semibold">
                  {leaseResult.formatted.depreciation}/{t("month")}
                </div>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-md">
                <div className="text-sm text-muted-foreground">{t("financeCharge")}</div>
                <div className="text-lg font-semibold">
                  {leaseResult.formatted.financeCharge}/{t("month")}
                </div>
              </div>
            </div>

            {/* Km Limits */}
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{t("kmLimit")}</div>
                  <div className="text-sm text-muted-foreground">
                    {leaseResult.annualKmLimit.toLocaleString()} km/{t("year")} (
                    {leaseResult.totalKmLimit.toLocaleString()} km {t("total")})
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">{t("excessKmCharge")}</div>
                  <div className="font-medium">
                    {currency} {leaseResult.excessKmCharge.toFixed(2)}/km
                  </div>
                </div>
              </div>
            </div>

            {/* Calculation Steps */}
            <div className="space-y-2">
              <Label>{t("calculationSteps")}</Label>
              <div className="p-4 bg-muted rounded-md text-sm space-y-1">
                {leaseResult.steps.map((step, i) => (
                  <div key={`lease-step-${i}-${step.slice(0, 20)}`} className="font-mono">
                    {i + 1}. {step}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparison Results */}
      {mode === "compare" && comparisonResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5" />
              {t("comparisonResult")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Side by Side Comparison */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-muted rounded-lg text-center">
                <CreditCard className="h-8 w-8 mx-auto mb-2" />
                <div className="text-lg font-medium">{t("modes.loan")}</div>
                <div className="text-3xl font-bold mt-2">
                  {comparisonResult.loan.formatted.monthlyPayment}
                </div>
                <div className="text-sm text-muted-foreground">{t("perMonth")}</div>
                <div className="mt-4 text-sm">
                  <div>
                    {t("totalCost")}: {comparisonResult.loan.formatted.totalCost}
                  </div>
                </div>
              </div>
              <div className="p-6 bg-muted rounded-lg text-center">
                <Key className="h-8 w-8 mx-auto mb-2" />
                <div className="text-lg font-medium">{t("modes.lease")}</div>
                <div className="text-3xl font-bold mt-2">
                  {comparisonResult.lease.formatted.monthlyPayment}
                </div>
                <div className="text-sm text-muted-foreground">{t("perMonth")}</div>
                <div className="mt-4 text-sm">
                  <div>
                    {t("totalCost")}: {comparisonResult.lease.formatted.totalCost}
                  </div>
                </div>
              </div>
            </div>

            {/* Difference Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`p-4 rounded-md ${comparisonResult.lowerMonthlyPayment === "loan" ? "bg-green-50 dark:bg-green-950" : "bg-muted"}`}
              >
                <div className="flex items-center gap-2">
                  {comparisonResult.lowerMonthlyPayment === "loan" ? (
                    <TrendingDown className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="font-medium">{t("lowerMonthlyPayment")}</span>
                </div>
                <div className="text-lg font-semibold mt-1">
                  {comparisonResult.lowerMonthlyPayment === "loan"
                    ? t("modes.loan")
                    : t("modes.lease")}
                </div>
              </div>
              <div
                className={`p-4 rounded-md ${comparisonResult.lowerTotalCost === "loan" ? "bg-green-50 dark:bg-green-950" : "bg-muted"}`}
              >
                <div className="flex items-center gap-2">
                  {comparisonResult.lowerTotalCost === "loan" ? (
                    <TrendingDown className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="font-medium">{t("lowerTotalCost")}</span>
                </div>
                <div className="text-lg font-semibold mt-1">
                  {comparisonResult.lowerTotalCost === "loan" ? t("modes.loan") : t("modes.lease")}
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-md">
              <div className="font-medium">{t("recommendation")}</div>
              <p className="mt-1 text-sm">{comparisonResult.recommendation}</p>
            </div>

            {/* Calculation Steps */}
            <div className="space-y-2">
              <Label>{t("calculationSteps")}</Label>
              <div className="p-4 bg-muted rounded-md text-sm space-y-1">
                {comparisonResult.steps.map((step, i) => (
                  <div
                    key={`financing-comparison-step-${i}-${step.slice(0, 20)}`}
                    className="font-mono"
                  >
                    {i + 1}. {step}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
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
