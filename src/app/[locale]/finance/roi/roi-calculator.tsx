"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateRoi, type RoiResult } from "@/lib/converters/finance/roi";

export function RoiCalculator() {
  const t = useTranslations("calculator");
  const format = useFormatter();

  const [initialInvestment, setInitialInvestment] = useState<number>(10000);
  const [finalValue, setFinalValue] = useState<number>(15000);
  const [years, setYears] = useState<number>(3);

  const calcResult = calculateRoi({
    initialInvestment,
    finalValue,
    years: years > 0 ? years : undefined,
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
            <Label htmlFor="initialInvestment">{t("finance.initialInvestment")}</Label>
            <Input
              id="initialInvestment"
              type="number"
              min="0"
              step="100"
              value={initialInvestment}
              onChange={(e) => setInitialInvestment(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="finalValue">{t("finance.finalValue")}</Label>
            <Input
              id="finalValue"
              type="number"
              min="0"
              step="100"
              value={finalValue}
              onChange={(e) => setFinalValue(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="years">{t("finance.investmentPeriodYears")}</Label>
            <Input
              id="years"
              type="number"
              min="0"
              step="1"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">{t("finance.leaveZeroForSimpleRoi")}</p>
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
              <div
                className={`p-4 rounded-lg ${result.profit >= 0 ? "bg-green-500/10" : "bg-red-500/10"}`}
              >
                <p className="text-sm text-muted-foreground">
                  {result.profit >= 0 ? t("finance.profit") : t("finance.loss")}
                </p>
                <p
                  className={`text-3xl font-bold ${result.profit >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {formatCurrency(result.profit)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">{t("finance.totalRoi")}</p>
                  <p
                    className={`text-xl font-bold ${result.roiPercent >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {result.roiPercent >= 0 ? "+" : ""}
                    {result.roiPercent.toFixed(2)}%
                  </p>
                </div>
                {result.annualizedRoiPercent !== undefined && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">{t("finance.annualizedRoi")}</p>
                    <p
                      className={`text-xl font-bold ${result.annualizedRoiPercent >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {result.annualizedRoiPercent >= 0 ? "+" : ""}
                      {result.annualizedRoiPercent.toFixed(2)}%
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("finance.initialInvestment")}</span>
                  <span>{formatCurrency(initialInvestment)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("finance.finalValue")}</span>
                  <span>{formatCurrency(finalValue)}</span>
                </div>
                {years > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("labels.period")}</span>
                    <span>{t("finance.yearsCount", { count: years })}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">{t("labels.enterValues")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
