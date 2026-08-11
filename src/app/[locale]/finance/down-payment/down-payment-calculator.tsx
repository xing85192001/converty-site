"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  calculateDownPayment,
  type DownPaymentResult,
} from "@/lib/converters/finance/down-payment";

export function DownPaymentCalculator() {
  const t = useTranslations("calculator");
  const format = useFormatter();

  const [homePrice, setHomePrice] = useState<number>(500000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [savingsGoalMonths, setSavingsGoalMonths] = useState<number>(36);
  const [currentSavings, setCurrentSavings] = useState<number>(20000);
  const [annualReturnRate, setAnnualReturnRate] = useState<number>(4);

  const calcResult = calculateDownPayment({
    homePrice,
    downPaymentPercent,
    savingsGoalMonths,
    currentSavings,
    annualReturnRate,
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
            <Label htmlFor="homePrice">{t("labels.homePrice")}</Label>
            <Input
              id="homePrice"
              type="number"
              min="50000"
              step="10000"
              value={homePrice}
              onChange={(e) => setHomePrice(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="downPaymentPercent">{t("finance.downPaymentPercent")}</Label>
            <Input
              id="downPaymentPercent"
              type="number"
              min="1"
              max="100"
              step="1"
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">{t("finance.downPaymentTypical")}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="savingsGoalMonths">{t("finance.savingsGoalMonths")}</Label>
            <Input
              id="savingsGoalMonths"
              type="number"
              min="6"
              max="120"
              step="6"
              value={savingsGoalMonths}
              onChange={(e) => setSavingsGoalMonths(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentSavings">{t("labels.currentSavings")}</Label>
            <Input
              id="currentSavings"
              type="number"
              min="0"
              step="1000"
              value={currentSavings}
              onChange={(e) => setCurrentSavings(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="annualReturnRate">{t("labels.down-payment-annual-return-rate")}</Label>
            <Input
              id="annualReturnRate"
              type="number"
              min="0"
              max="15"
              step="0.5"
              value={annualReturnRate}
              onChange={(e) => setAnnualReturnRate(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">{t("hints.down-payment-annual-return")}</p>
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
                <p className="text-sm text-muted-foreground">
                  {t("finance.monthlyContributionNeeded")}
                </p>
                <p className="text-3xl font-bold">{formatCurrency(result.monthlyContribution)}</p>
              </div>

              <div className="p-4 bg-blue-500/10 rounded-lg">
                <p className="text-sm text-muted-foreground">{t("finance.downPaymentGoal")}</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(result.downPaymentAmount)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {downPaymentPercent}% {t("finance.downPaymentOf")} {formatCurrency(homePrice)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {t("labels.down-payment-amount-needed")}
                  </p>
                  <p className="text-xl font-bold">{formatCurrency(result.amountNeeded)}</p>
                </div>
                <div className="p-4 bg-green-500/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">{t("finance.interestEarned")}</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(result.interestEarned)}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">{t("labels.loanAmount")}</p>
                <p className="text-xl font-bold">{formatCurrency(result.loanAmount)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("finance.downPaymentAfter")} {downPaymentPercent}%{" "}
                  {t("finance.downPaymentLabel")}
                </p>
              </div>

              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("labels.currentSavings")}</span>
                  <span>{formatCurrency(currentSavings)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">+ {t("finance.contributions")}</span>
                  <span>{formatCurrency(result.totalContributions)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">+ {t("finance.interestEarned")}</span>
                  <span>{formatCurrency(result.interestEarned)}</span>
                </div>
                <div className="flex justify-between font-bold pt-2">
                  <span>= {t("labels.downPayment")}</span>
                  <span>{formatCurrency(result.downPaymentAmount)}</span>
                </div>
              </div>

              {result.projections.length > 0 && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">
                    {t("labels.down-payment-savings-milestones")}
                  </p>
                  <div className="space-y-2 text-sm">
                    {result.projections.map((proj) => (
                      <div key={proj.month} className="flex justify-between">
                        <span className="text-muted-foreground">
                          {t("labels.down-payment-month")} {proj.month}
                        </span>
                        <span>{formatCurrency(proj.balance)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">{t("messages.enter-valid-values")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
