"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type BreakEvenResult, calculateBreakEven } from "@/lib/converters/finance/break-even";

export function BreakEvenCalculator() {
  const t = useTranslations("calculator");
  const format = useFormatter();

  const [fixedCosts, setFixedCosts] = useState<number>(10000);
  const [variableCostPerUnit, setVariableCostPerUnit] = useState<number>(20);
  const [pricePerUnit, setPricePerUnit] = useState<number>(50);

  const calcResult = calculateBreakEven({
    fixedCosts,
    variableCostPerUnit,
    pricePerUnit,
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
            <Label htmlFor="fixedCosts">{t("labels.fixedCosts")}</Label>
            <Input
              id="fixedCosts"
              type="number"
              min="0"
              step="100"
              value={fixedCosts}
              onChange={(e) => setFixedCosts(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">{t("labels.fixedCostsHint")}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="variableCostPerUnit">{t("labels.variableCostPerUnit")}</Label>
            <Input
              id="variableCostPerUnit"
              type="number"
              min="0"
              step="1"
              value={variableCostPerUnit}
              onChange={(e) => setVariableCostPerUnit(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">{t("labels.variableCostPerUnitHint")}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pricePerUnit">{t("labels.sellingPricePerUnit")}</Label>
            <Input
              id="pricePerUnit"
              type="number"
              min="0"
              step="1"
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(Number(e.target.value))}
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
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground">{t("labels.breakEvenPoint")}</p>
                <p className="text-3xl font-bold">
                  {Math.ceil(result.breakEvenUnits)} {t("labels.units")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("labels.revenue")}: {formatCurrency(result.breakEvenRevenue)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">{t("labels.contributionMargin")}</p>
                  <p className="text-xl font-bold">{formatCurrency(result.contributionMargin)}</p>
                  <p className="text-xs text-muted-foreground">{t("labels.perUnit")}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">{t("labels.cmRatio")}</p>
                  <p className="text-xl font-bold">{result.contributionMarginRatio.toFixed(1)}%</p>
                </div>
              </div>

              {result.profitAtUnits && result.profitAtUnits.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">{t("labels.profitAnalysis")}</h4>
                  <div className="space-y-2">
                    {result.profitAtUnits.map((item) => (
                      <div
                        key={item.units}
                        className={`flex justify-between text-sm py-2 px-3 rounded ${
                          item.profit >= 0 ? "bg-green-500/10" : "bg-red-500/10"
                        }`}
                      >
                        <span>
                          {item.units} {t("labels.units")}
                        </span>
                        <span className={item.profit >= 0 ? "text-green-600" : "text-red-600"}>
                          {item.profit >= 0 ? "+" : ""}
                          {formatCurrency(item.profit)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-yellow-500/10 rounded-lg">
              <p className="text-sm text-yellow-600">{t("errors.priceGreaterThanVariable")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
