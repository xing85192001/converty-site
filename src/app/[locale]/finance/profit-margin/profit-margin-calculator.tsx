"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  calculateProfitMargin,
  type ProfitMarginResult,
} from "@/lib/converters/finance/profit-margin";

export function ProfitMarginCalculator() {
  const t = useTranslations("calculator");
  const format = useFormatter();

  const [revenue, setRevenue] = useState<number>(100000);
  const [costOfGoodsSold, setCostOfGoodsSold] = useState<number>(60000);
  const [operatingExpenses, setOperatingExpenses] = useState<number>(20000);
  const [taxes, setTaxes] = useState<number>(5000);

  const calcResult = calculateProfitMargin({
    revenue,
    costOfGoodsSold,
    operatingExpenses,
    taxes,
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
            <Label htmlFor="revenue">{t("finance.revenueSales")}</Label>
            <Input
              id="revenue"
              type="number"
              min="0"
              step="1000"
              value={revenue}
              onChange={(e) => setRevenue(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cogs">{t("finance.costOfGoodsSold")}</Label>
            <Input
              id="cogs"
              type="number"
              min="0"
              step="1000"
              value={costOfGoodsSold}
              onChange={(e) => setCostOfGoodsSold(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">{t("finance.cogsDescription")}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="opex">{t("finance.operatingExpenses")}</Label>
            <Input
              id="opex"
              type="number"
              min="0"
              step="1000"
              value={operatingExpenses}
              onChange={(e) => setOperatingExpenses(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">{t("finance.opexDescription")}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxes">{t("finance.taxes")}</Label>
            <Input
              id="taxes"
              type="number"
              min="0"
              step="100"
              value={taxes}
              onChange={(e) => setTaxes(Number(e.target.value))}
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
              <div className="space-y-3">
                <div className="p-4 bg-blue-500/10 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">{t("finance.grossProfit")}</p>
                      <p className="text-xl font-bold">{formatCurrency(result.grossProfit)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{t("finance.grossMargin")}</p>
                      <p className="text-xl font-bold text-blue-600">
                        {result.grossMargin.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                {result.operatingProfit !== undefined && (
                  <div className="p-4 bg-purple-500/10 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {t("finance.operatingProfit")}
                        </p>
                        <p className="text-xl font-bold">
                          {formatCurrency(result.operatingProfit)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {t("finance.operatingMargin")}
                        </p>
                        <p className="text-xl font-bold text-purple-600">
                          {result.operatingMargin?.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {result.netProfit !== undefined && (
                  <div
                    className={`p-4 rounded-lg ${result.netProfit >= 0 ? "bg-green-500/10" : "bg-red-500/10"}`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">{t("finance.netProfit")}</p>
                        <p className="text-xl font-bold">{formatCurrency(result.netProfit)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{t("finance.netMargin")}</p>
                        <p
                          className={`text-xl font-bold ${result.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {result.netMargin?.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">{t("finance.markupOnCogs")}</p>
                <p className="text-xl font-bold">{result.markup.toFixed(1)}%</p>
              </div>

              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("finance.revenue")}</span>
                  <span>{formatCurrency(revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("finance.minusCogs")}</span>
                  <span>{formatCurrency(costOfGoodsSold)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>{t("finance.equalsGrossProfit")}</span>
                  <span>{formatCurrency(result.grossProfit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("finance.minusOperatingExpenses")}
                  </span>
                  <span>{formatCurrency(operatingExpenses)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>{t("finance.equalsOperatingProfit")}</span>
                  <span>{formatCurrency(result.operatingProfit ?? 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("finance.minusTaxes")}</span>
                  <span>{formatCurrency(taxes)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>{t("finance.equalsNetProfit")}</span>
                  <span>{formatCurrency(result.netProfit ?? 0)}</span>
                </div>
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
