"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateDiscount, type DiscountResult } from "@/lib/converters/finance/discount";

export function DiscountCalculator() {
  const t = useTranslations("calculator");
  const format = useFormatter();

  const [originalPrice, setOriginalPrice] = useState<number>(100);
  const [discountPercent, setDiscountPercent] = useState<number>(20);

  const calcResult = calculateDiscount({
    originalPrice,
    discountPercent,
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
            <Label htmlFor="originalPrice">{t("finance.original-price")}</Label>
            <Input
              id="originalPrice"
              type="number"
              min="0"
              step="0.01"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discountPercent">{t("finance.discount-percent")}</Label>
            <Input
              id="discountPercent"
              type="number"
              min="0"
              max="100"
              step="1"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
            />
            <div className="flex flex-wrap gap-2 pt-2">
              {[10, 15, 20, 25, 30, 50].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setDiscountPercent(pct)}
                  className={`px-3 py-1 text-sm rounded-md border ${
                    discountPercent === pct
                      ? "bg-primary text-primary-foreground"
                      : "bg-background hover:bg-accent"
                  }`}
                >
                  {pct}%
                </button>
              ))}
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
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm text-muted-foreground">{t("finance.sale-price")}</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(result.finalPrice)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">{t("finance.you-save")}</p>
                  <p className="text-xl font-bold">{formatCurrency(result.savings)}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">{t("finance.discount")}</p>
                  <p className="text-xl font-bold">{result.discountPercent}%</p>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">{t("finance.original-price")}</p>
                <p className="text-xl font-bold line-through text-muted-foreground">
                  {formatCurrency(result.originalPrice)}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">{t("finance.enter-values")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
