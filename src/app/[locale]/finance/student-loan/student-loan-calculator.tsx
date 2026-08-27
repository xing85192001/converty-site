"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  calculateStudentLoan,
  type StudentLoanResult,
} from "@/lib/converters/finance/student-loan";

export function StudentLoanCalculator() {
  const t = useTranslations("calculator");
  const format = useFormatter();

  const [loanAmount, setLoanAmount] = useState<number>(30000);
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(5.5);
  const [loanTermYears, setLoanTermYears] = useState<number>(10);
  const [gracePeriodMonths, setGracePeriodMonths] = useState<number>(6);
  const [interestCapitalized, setInterestCapitalized] = useState<boolean>(true);

  const calcResult = calculateStudentLoan({
    loanAmount,
    annualInterestRate,
    loanTermYears,
    gracePeriodMonths,
    interestCapitalized,
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
              max="15"
              step="0.1"
              value={annualInterestRate}
              onChange={(e) => setAnnualInterestRate(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="loanTermYears">{t("finance.repaymentTerm")}</Label>
            <Input
              id="loanTermYears"
              type="number"
              min="1"
              max="30"
              step="1"
              value={loanTermYears}
              onChange={(e) => setLoanTermYears(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gracePeriodMonths">{t("finance.gracePeriod")}</Label>
            <Input
              id="gracePeriodMonths"
              type="number"
              min="0"
              max="24"
              step="1"
              value={gracePeriodMonths}
              onChange={(e) => setGracePeriodMonths(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">{t("finance.gracePeriodDescription")}</p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="interestCapitalized"
              type="checkbox"
              checked={interestCapitalized}
              onChange={(e) => setInterestCapitalized(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="interestCapitalized" className="text-sm font-normal">
              {t("finance.capitalizeInterest")}
            </Label>
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

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">{t("finance.payoffDate")}</p>
                <p className="text-xl font-bold">{result.payoffDate}</p>
              </div>

              {gracePeriodMonths > 0 && (
                <div className="p-4 bg-yellow-500/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {t("finance.gracePeriodInterest")}
                  </p>
                  <p className="text-xl font-bold text-yellow-600">
                    {formatCurrency(result.gracePeriodInterest)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {interestCapitalized
                      ? t("labels.interest-capitalized")
                      : t("labels.interest-not-capitalized")}
                  </p>
                </div>
              )}

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
                  <span className="text-muted-foreground">{t("labels.original-loan")}</span>
                  <span>{formatCurrency(loanAmount)}</span>
                </div>
                {interestCapitalized && gracePeriodMonths > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("finance.gracePeriodInterestDetail")}
                      </span>
                      <span>{formatCurrency(result.gracePeriodInterest)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>{t("labels.principal-at-repayment")}</span>
                      <span>{formatCurrency(result.principalAfterGrace)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between pt-2 font-bold">
                  <span>{t("labels.total-repayment")}</span>
                  <span>{formatCurrency(result.totalCost)}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">{t("labels.enter-values")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
