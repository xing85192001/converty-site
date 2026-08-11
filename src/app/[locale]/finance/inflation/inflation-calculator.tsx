"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateInflation, type InflationResult } from "@/lib/converters/finance/inflation";

export function InflationCalculator() {
  const t = useTranslations("calculator");
  const tInflation = useTranslations("calculator.inflation");
  const format = useFormatter();

  const [amount, setAmount] = useState<number>(1000);
  const [inflationRate, setInflationRate] = useState<number>(2.5);
  const [years, setYears] = useState<number>(10);

  const calcResult = calculateInflation({
    amount,
    inflationRate,
    years,
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
            <Label htmlFor="amount">{tInflation("currentAmount")}</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="100"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="inflationRate">{tInflation("inflationRate")}</Label>
            <Input
              id="inflationRate"
              type="number"
              min="0"
              max="50"
              step="0.1"
              value={inflationRate}
              onChange={(e) => setInflationRate(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="years">{tInflation("numberOfYears")}</Label>
            <Input
              id="years"
              type="number"
              min="1"
              max="100"
              step="1"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
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
              <div className="p-4 bg-red-500/10 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {tInflation("inYearsNeed", { years })}
                </p>
                <p className="text-3xl font-bold text-red-600">
                  {formatCurrency(result.futureValue)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {tInflation("samePurchasingPower", { amount: formatCurrency(amount) })}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {tInflation("purchasingPowerLoss")}
                  </p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(result.purchasingPowerLoss)}
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">{tInflation("lossPercentage")}</p>
                  <p className="text-xl font-bold text-red-600">
                    {result.purchasingPowerLossPercent.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {tInflation("todayEquivalent", { amount: formatCurrency(amount) })}
                </p>
                <p className="text-xl font-bold">{formatCurrency(result.equivalentPastValue)}</p>
                <p className="text-sm text-muted-foreground">
                  {tInflation("inTodaysDollars", { years })}
                </p>
              </div>

              {result.yearlyBreakdown.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">{tInflation("yearByYearImpact")}</h4>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {result.yearlyBreakdown.map((item) => (
                      <div key={item.year} className="flex justify-between text-sm py-1">
                        <span className="text-muted-foreground">
                          {tInflation("year", { year: item.year })}
                        </span>
                        <span>{formatCurrency(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">{tInflation("enterValues")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
