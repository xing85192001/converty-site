"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  calculateRetirement401k,
  type Retirement401kResult,
} from "@/lib/converters/finance/retirement-401k";

export function Retirement401kCalculator() {
  const t = useTranslations("calculator");
  const format = useFormatter();

  const [currentAge, setCurrentAge] = useState<number>(30);
  const [retirementAge, setRetirementAge] = useState<number>(65);
  const [currentBalance, setCurrentBalance] = useState<number>(50000);
  const [annualContribution, setAnnualContribution] = useState<number>(10000);
  const [employerMatch, setEmployerMatch] = useState<number>(50);
  const [employerMatchLimit, setEmployerMatchLimit] = useState<number>(6);
  const [annualReturnRate, setAnnualReturnRate] = useState<number>(7);
  const [annualSalaryGrowth, setAnnualSalaryGrowth] = useState<number>(2);

  const calcResult = calculateRetirement401k({
    currentAge,
    retirementAge,
    currentBalance,
    annualContribution,
    employerMatch,
    employerMatchLimit,
    annualReturnRate,
    annualSalaryGrowth,
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentAge">{t("finance.currentAge")}</Label>
              <Input
                id="currentAge"
                type="number"
                min="18"
                max="70"
                value={currentAge}
                onChange={(e) => setCurrentAge(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retirementAge">{t("finance.retirementAge")}</Label>
              <Input
                id="retirementAge"
                type="number"
                min="50"
                max="75"
                value={retirementAge}
                onChange={(e) => setRetirementAge(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentBalance">{t("finance.currentBalance")}</Label>
            <Input
              id="currentBalance"
              type="number"
              min="0"
              step="1000"
              value={currentBalance}
              onChange={(e) => setCurrentBalance(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="annualContribution">{t("finance.annualContributionLabel")}</Label>
            <Input
              id="annualContribution"
              type="number"
              min="0"
              step="500"
              value={annualContribution}
              onChange={(e) => setAnnualContribution(Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employerMatch">{t("finance.employerMatch")}</Label>
              <Input
                id="employerMatch"
                type="number"
                min="0"
                max="100"
                step="5"
                value={employerMatch}
                onChange={(e) => setEmployerMatch(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employerMatchLimit">{t("finance.matchLimit")}</Label>
              <Input
                id="employerMatchLimit"
                type="number"
                min="0"
                max="100"
                step="1"
                value={employerMatchLimit}
                onChange={(e) => setEmployerMatchLimit(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="annualReturnRate">{t("finance.returnRate")}</Label>
              <Input
                id="annualReturnRate"
                type="number"
                min="0"
                max="15"
                step="0.5"
                value={annualReturnRate}
                onChange={(e) => setAnnualReturnRate(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="annualSalaryGrowth">{t("finance.salaryGrowth")}</Label>
              <Input
                id="annualSalaryGrowth"
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={annualSalaryGrowth}
                onChange={(e) => setAnnualSalaryGrowth(Number(e.target.value))}
              />
            </div>
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
                <p className="text-sm text-muted-foreground">{t("finance.totalAtRetirement")}</p>
                <p className="text-3xl font-bold">{formatCurrency(result.totalAtRetirement)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("finance.yearsToRetirement", {
                    years: result.yearsToRetirement,
                    age: retirementAge,
                  })}
                </p>
              </div>

              <div className="p-4 bg-green-500/10 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {t("finance.monthlyRetirementIncome")}
                </p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(result.monthlyInRetirement)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{t("finance.withdrawalRule")}</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">{t("finance.contributions")}</p>
                  <p className="text-lg font-bold">{formatCurrency(result.totalContributions)}</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <p className="text-xs text-muted-foreground">{t("finance.employerMatchLabel")}</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(result.totalEmployerMatch)}
                  </p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <p className="text-xs text-muted-foreground">{t("finance.growth")}</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(result.totalGrowth)}
                  </p>
                </div>
              </div>

              {result.projections.length > 0 && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">{t("finance.balanceProjections")}</p>
                  <div className="space-y-2 text-sm">
                    {result.projections.map((proj) => (
                      <div key={proj.age} className="flex justify-between">
                        <span className="text-muted-foreground">
                          {t("finance.ageLabelWithValue", { age: proj.age })}
                        </span>
                        <span>{formatCurrency(proj.balance)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">{t("finance.enterValuesToCalculate")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
