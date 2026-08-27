"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type CreditCardResult, calculateCreditCard } from "@/lib/converters/finance/credit-card";

export function CreditCardCalculator() {
  const t = useTranslations("calculator");
  const format = useFormatter();

  const [balance, setBalance] = useState<number>(5000);
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(19.99);
  const [minimumPaymentPercent, setMinimumPaymentPercent] = useState<number>(2);
  const [minimumPaymentFixed, setMinimumPaymentFixed] = useState<number>(25);
  const [additionalPayment, setAdditionalPayment] = useState<number>(50);
  const [targetMonths, setTargetMonths] = useState<number>(24);

  const calcResult = calculateCreditCard({
    balance,
    annualInterestRate,
    minimumPaymentPercent,
    minimumPaymentFixed,
    additionalPayment,
    targetMonths,
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
            <Label htmlFor="balance">{t("finance.currentBalance")}</Label>
            <Input
              id="balance"
              type="number"
              min="100"
              step="100"
              value={balance}
              onChange={(e) => setBalance(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="annualInterestRate">{t("finance.interestRatePercent")}</Label>
            <Input
              id="annualInterestRate"
              type="number"
              min="0"
              max="40"
              step="0.01"
              value={annualInterestRate}
              onChange={(e) => setAnnualInterestRate(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minimumPaymentPercent">{t("finance.minimumPaymentPercent")}</Label>
            <Input
              id="minimumPaymentPercent"
              type="number"
              min="1"
              max="10"
              step="0.1"
              value={minimumPaymentPercent}
              onChange={(e) => setMinimumPaymentPercent(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              {t("finance.minimumPaymentDescription")}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minimumPaymentFixed">{t("finance.minimumPaymentFloor")}</Label>
            <Input
              id="minimumPaymentFixed"
              type="number"
              min="10"
              step="5"
              value={minimumPaymentFixed}
              onChange={(e) => setMinimumPaymentFixed(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              {t("finance.minimumPaymentFloorDescription")}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalPayment">{t("finance.additionalPayment")}</Label>
            <Input
              id="additionalPayment"
              type="number"
              min="0"
              step="10"
              value={additionalPayment}
              onChange={(e) => setAdditionalPayment(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetMonths">{t("finance.targetPayoffMonths")}</Label>
            <Input
              id="targetMonths"
              type="number"
              min="1"
              max="120"
              step="1"
              value={targetMonths}
              onChange={(e) => setTargetMonths(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">{t("finance.targetPayoffDescription")}</p>
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
                <p className="text-sm text-muted-foreground">{t("finance.firstPayment")}</p>
                <p className="text-3xl font-bold">{formatCurrency(result.firstPayment)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("finance.average")}: {formatCurrency(result.averagePayment)}
                </p>
              </div>

              <div className="p-4 bg-yellow-500/10 rounded-lg">
                <p className="text-sm text-muted-foreground">{t("finance.timeToPayoff")}</p>
                <p className="text-xl font-bold text-yellow-600">
                  {t("finance.yearsMonthsFormat", {
                    years: Math.floor(result.yearsToPayoff),
                    months: result.monthsToPayoff % 12,
                  })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ({t("finance.totalMonthsCount", { count: result.monthsToPayoff })})
                </p>
              </div>

              {result.paymentForTarget && (
                <div className="p-4 bg-blue-500/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {t("finance.paymentForTargetPayoff", { months: targetMonths })}
                  </p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(result.paymentForTarget)}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-red-500/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">{t("finance.totalInterest")}</p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(result.totalInterest)}
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">{t("finance.totalPaid")}</p>
                  <p className="text-xl font-bold">{formatCurrency(result.totalPaid)}</p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("finance.currentBalance")}</span>
                  <span>{formatCurrency(balance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("finance.plusTotalInterest")}</span>
                  <span>{formatCurrency(result.totalInterest)}</span>
                </div>
                <div className="flex justify-between font-bold pt-2">
                  <span>{t("finance.equalsTotalCost")}</span>
                  <span>{formatCurrency(result.totalPaid)}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">{t("finance.enterValidValuesCreditCard")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
