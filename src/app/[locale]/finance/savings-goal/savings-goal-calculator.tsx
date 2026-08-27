"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  calculateSavingsGoal,
  type SavingsGoalResult,
} from "@/lib/converters/finance/savings-goal";

export function SavingsGoalCalculator() {
  const t = useTranslations("calculator");
  const format = useFormatter();

  const [goalAmount, setGoalAmount] = useState<number>(50000);
  const [currentSavings, setCurrentSavings] = useState<number>(5000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(500);
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(4);

  const calcResult = calculateSavingsGoal({
    goalAmount,
    currentSavings,
    monthlyContribution,
    annualInterestRate,
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
            <Label htmlFor="goalAmount">{t("finance.savingsGoal")}</Label>
            <Input
              id="goalAmount"
              type="number"
              min="0"
              step="1000"
              value={goalAmount}
              onChange={(e) => setGoalAmount(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentSavings">{t("finance.currentSavings")}</Label>
            <Input
              id="currentSavings"
              type="number"
              min="0"
              step="100"
              value={currentSavings}
              onChange={(e) => setCurrentSavings(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyContribution">{t("finance.monthlyContribution")}</Label>
            <Input
              id="monthlyContribution"
              type="number"
              min="0"
              step="50"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="annualInterestRate">{t("finance.interestRatePercent")}</Label>
            <Input
              id="annualInterestRate"
              type="number"
              min="0"
              max="30"
              step="0.1"
              value={annualInterestRate}
              onChange={(e) => setAnnualInterestRate(Number(e.target.value))}
            />
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
              {result.goalReachable ? (
                <>
                  <div className="p-4 bg-green-500/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">{t("finance.timeToReachGoal")}</p>
                    <p className="text-3xl font-bold text-green-600">
                      {t("finance.yearsCount", { count: Math.round(result.yearsToGoal * 10) / 10 })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ({t("finance.totalMonthsCount", { count: result.monthsToGoal })})
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        {t("finance.totalContributions")}
                      </p>
                      <p className="text-xl font-bold">
                        {formatCurrency(result.totalContributions)}
                      </p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">{t("finance.interestEarned")}</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(result.totalInterestEarned)}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">{t("finance.finalBalance")}</p>
                    <p className="text-xl font-bold">{formatCurrency(result.finalBalance)}</p>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-yellow-500/10 rounded-lg">
                  <p className="text-lg font-medium text-yellow-600">
                    {t("finance.goalNotReachable")}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {t("finance.goalNotReachableDescription")}
                  </p>
                </div>
              )}

              {result.projections.length > 0 && result.goalReachable && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">{t("finance.yearlyProgress")}</h4>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {result.projections.map((item) => (
                      <div key={item.month} className="flex justify-between text-sm py-1">
                        <span className="text-muted-foreground">
                          {t("finance.yearsCount", { count: Math.floor(item.month / 12) })}
                        </span>
                        <span>{formatCurrency(item.balance)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">{t("labels.enterValues")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
