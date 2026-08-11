"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateHomeEquity, type HomeEquityResult } from "@/lib/converters/finance/home-equity";

export function HomeEquityCalculator() {
  const t = useTranslations("calculator");
  const format = useFormatter();

  const [homeValue, setHomeValue] = useState<number>(500000);
  const [mortgageBalance, setMortgageBalance] = useState<number>(300000);
  const [loanAmount, setLoanAmount] = useState<number>(50000);
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(7.5);
  const [loanTermYears, setLoanTermYears] = useState<number>(15);
  const [isHELOC, setIsHELOC] = useState<boolean>(false);

  const calcResult = calculateHomeEquity({
    homeValue,
    mortgageBalance,
    loanAmount,
    annualInterestRate,
    loanTermYears,
    isHELOC,
  });
  const result = calcResult.ok ? calcResult.value : null;

  const formatCurrency = (value: number) =>
    format.number(value, { style: "currency", currency: "CHF" });

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t("sections.input")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="homeValue">{t("finance.homeValue")}</Label>
            <Input
              id="homeValue"
              type="number"
              min="0"
              step="10000"
              value={homeValue}
              onChange={(e) => setHomeValue(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mortgageBalance">{t("labels.current-mortgage-balance")}</Label>
            <Input
              id="mortgageBalance"
              type="number"
              min="0"
              step="5000"
              value={mortgageBalance}
              onChange={(e) => setMortgageBalance(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="loanAmount">{t("labels.loanAmount")}</Label>
            <Input
              id="loanAmount"
              type="number"
              min="0"
              step="5000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="annualInterestRate">{t("labels.interestRate")}</Label>
            <Input
              id="annualInterestRate"
              type="number"
              min="0"
              max="20"
              step="0.1"
              value={annualInterestRate}
              onChange={(e) => setAnnualInterestRate(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="loanTermYears">{t("finance.loanTermYears")}</Label>
            <Input
              id="loanTermYears"
              type="number"
              min="5"
              max="30"
              step="5"
              value={loanTermYears}
              onChange={(e) => setLoanTermYears(Number(e.target.value))}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="isHELOC"
              type="checkbox"
              checked={isHELOC}
              onChange={(e) => setIsHELOC(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isHELOC" className="text-sm font-normal">
              {t("labels.heloc")}
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">{t("labels.heloc-description")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("sections.results")}</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground">{t("labels.monthlyPayment")}</p>
                <p className="text-3xl font-bold">{formatCurrency(result.monthlyPayment)}</p>
                {isHELOC && result.interestOnlyPayment && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("results.interest-only-during-draw")}{" "}
                    {formatCurrency(result.interestOnlyPayment)}
                  </p>
                )}
              </div>

              <div className="p-4 bg-blue-500/10 rounded-lg">
                <p className="text-sm text-muted-foreground">{t("results.available-equity")}</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(result.availableEquity)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("results.available-equity-description")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">{t("results.current-ltv")}</p>
                  <p className="text-xl font-bold">{result.loanToValue.toFixed(1)}%</p>
                </div>
                <div
                  className={`p-4 rounded-lg ${result.combinedLTV > 80 ? "bg-yellow-500/10" : "bg-green-500/10"}`}
                >
                  <p className="text-sm text-muted-foreground">{t("results.combined-ltv")}</p>
                  <p
                    className={`text-xl font-bold ${result.combinedLTV > 80 ? "text-yellow-600" : "text-green-600"}`}
                  >
                    {result.combinedLTV.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-red-500/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">{t("labels.totalInterest")}</p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(result.totalInterest)}
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">{t("finance.totalCost")}</p>
                  <p className="text-xl font-bold">{formatCurrency(result.totalCost)}</p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("finance.homeValue")}</span>
                  <span>{formatCurrency(homeValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("results.mortgage-balance-label")}
                  </span>
                  <span>{formatCurrency(mortgageBalance)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>{t("results.current-equity")}</span>
                  <span>{formatCurrency(homeValue - mortgageBalance)}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-muted-foreground">{t("results.new-loan-amount")}</span>
                  <span>{formatCurrency(loanAmount)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>{t("finance.equityAfterLoan")}</span>
                  <span>{formatCurrency(homeValue - mortgageBalance - loanAmount)}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">{t("finance.emptyState")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
