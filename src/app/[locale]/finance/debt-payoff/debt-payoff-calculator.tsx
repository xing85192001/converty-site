"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateDebtPayoff, type DebtPayoffResult } from "@/lib/converters/finance/debt-payoff";

export function DebtPayoffCalculator() {
  const t = useTranslations("calculator");
  const format = useFormatter();

  const [totalDebt, setTotalDebt] = useState<number>(10000);
  const [interestRate, setInterestRate] = useState<number>(18);
  const [minimumPayment, setMinimumPayment] = useState<number>(250);
  const [extraPayment, setExtraPayment] = useState<number>(100);

  const calcResult = calculateDebtPayoff({
    totalDebt,
    interestRate,
    minimumPayment,
    extraPayment,
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
            <Label htmlFor="totalDebt">{t("labels.totalDebt")}</Label>
            <Input
              id="totalDebt"
              type="number"
              min="100"
              step="100"
              value={totalDebt}
              onChange={(e) => setTotalDebt(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interestRate">{t("labels.interestRate")}</Label>
            <Input
              id="interestRate"
              type="number"
              min="0"
              max="40"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minimumPayment">{t("labels.minimumPayment")}</Label>
            <Input
              id="minimumPayment"
              type="number"
              min="10"
              step="10"
              value={minimumPayment}
              onChange={(e) => setMinimumPayment(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="extraPayment">{t("labels.extraPayment")}</Label>
            <Input
              id="extraPayment"
              type="number"
              min="0"
              step="10"
              value={extraPayment}
              onChange={(e) => setExtraPayment(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">{t("labels.extraPaymentHelp")}</p>
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

              <div className="p-4 bg-green-500/10 rounded-lg">
                <p className="text-sm text-muted-foreground">{t("labels.timeToPayoff")}</p>
                <p className="text-xl font-bold text-green-600">
                  {Math.floor(result.yearsToPayoff)} years, {result.monthsToPayoff % 12} months
                </p>
              </div>

              {extraPayment > 0 && result.monthsSaved > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-500/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">{t("labels.timeSaved")}</p>
                    <p className="text-xl font-bold text-blue-600">{result.monthsSaved} months</p>
                  </div>
                  <div className="p-4 bg-blue-500/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">{t("labels.interestSaved")}</p>
                    <p className="text-xl font-bold text-blue-600">
                      {formatCurrency(result.interestSaved)}
                    </p>
                  </div>
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
                  <p className="text-sm text-muted-foreground">{t("labels.totalPaid")}</p>
                  <p className="text-xl font-bold">{formatCurrency(result.totalPaid)}</p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("labels.originalDebt")}</span>
                  <span>{formatCurrency(totalDebt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("labels.plusTotalInterest")}</span>
                  <span>{formatCurrency(result.totalInterest)}</span>
                </div>
                <div className="flex justify-between font-bold pt-2">
                  <span>{t("labels.equalsTotalRepayment")}</span>
                  <span>{formatCurrency(result.totalPaid)}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">{t("labels.enterValidValues")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
