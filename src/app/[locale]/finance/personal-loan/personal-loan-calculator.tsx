"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  calculatePersonalLoan,
  type PersonalLoanResult,
} from "@/lib/converters/finance/personal-loan";

export function PersonalLoanCalculator() {
  const t = useTranslations("calculator");
  const format = useFormatter();

  const [loanAmount, setLoanAmount] = useState<number>(15000);
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(9.5);
  const [loanTermMonths, setLoanTermMonths] = useState<number>(36);
  const [originationFee, setOriginationFee] = useState<number>(2);

  const calcResult = calculatePersonalLoan({
    loanAmount,
    annualInterestRate,
    loanTermMonths,
    originationFee,
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
            <Label htmlFor="loanAmount">{t("labels.loanAmount")}</Label>
            <Input
              id="loanAmount"
              type="number"
              min="1000"
              step="1000"
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
              max="36"
              step="0.1"
              value={annualInterestRate}
              onChange={(e) => setAnnualInterestRate(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="loanTermMonths">{t("results.loanTermMonths")}</Label>
            <Input
              id="loanTermMonths"
              type="number"
              min="6"
              max="84"
              step="6"
              value={loanTermMonths}
              onChange={(e) => setLoanTermMonths(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="originationFee">{t("finance.originationFee")}</Label>
            <Input
              id="originationFee"
              type="number"
              min="0"
              max="10"
              step="0.5"
              value={originationFee}
              onChange={(e) => setOriginationFee(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">{t("finance.originationFeeHelp")}</p>
          </div>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {t("finance.originationFeeLabel")}
                  </p>
                  <p className="text-xl font-bold">{formatCurrency(result.originationFeeAmount)}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">{t("finance.trueApr")}</p>
                  <p className="text-xl font-bold">{result.apr.toFixed(2)}%</p>
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
                  <span className="text-muted-foreground">{t("finance.breakdownLoanAmount")}</span>
                  <span>{formatCurrency(loanAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("finance.breakdownOriginationFee")}
                  </span>
                  <span>{formatCurrency(result.originationFeeAmount)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>{t("finance.youReceive")}</span>
                  <span>{formatCurrency(loanAmount - result.originationFeeAmount)}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-muted-foreground">{t("finance.totalPayments")}</span>
                  <span>{formatCurrency(result.monthlyPayment * loanTermMonths)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>{t("finance.totalCostInclFee")}</span>
                  <span>{formatCurrency(result.totalCost)}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">{t("finance.enterValuesToCalculate")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
