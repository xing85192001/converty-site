"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateTip, type TipResult } from "@/lib/converters/finance/tip";

export function TipCalculator() {
  const t = useTranslations("calculator");
  const format = useFormatter();

  const [billAmount, setBillAmount] = useState<number>(100);
  const [tipPercentage, setTipPercentage] = useState<number>(15);
  const [numberOfPeople, setNumberOfPeople] = useState<number>(1);

  const calcResult = calculateTip({
    billAmount,
    tipPercentage,
    numberOfPeople,
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
            <Label htmlFor="billAmount">{t("labels.amount")}</Label>
            <Input
              id="billAmount"
              type="number"
              min="0"
              step="0.01"
              value={billAmount}
              onChange={(e) => setBillAmount(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipPercentage">{t("finance.tipPercentage")}</Label>
            <Input
              id="tipPercentage"
              type="number"
              min="0"
              max="100"
              step="1"
              value={tipPercentage}
              onChange={(e) => setTipPercentage(Number(e.target.value))}
            />
            <div className="flex gap-2 pt-2">
              {[10, 15, 18, 20, 25].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setTipPercentage(pct)}
                  className={`px-3 py-1 text-sm rounded-md border ${
                    tipPercentage === pct
                      ? "bg-primary text-primary-foreground"
                      : "bg-background hover:bg-accent"
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="numberOfPeople">{t("finance.numberOfPeople")}</Label>
            <Input
              id="numberOfPeople"
              type="number"
              min="1"
              step="1"
              value={numberOfPeople}
              onChange={(e) => setNumberOfPeople(Math.max(1, Number(e.target.value)))}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">{t("finance.tipAmount")}</p>
                  <p className="text-2xl font-bold">{formatCurrency(result.tipAmount)}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">{t("results.total")}</p>
                  <p className="text-2xl font-bold">{formatCurrency(result.totalAmount)}</p>
                </div>
              </div>

              {numberOfPeople > 1 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">{t("finance.perPerson")}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">{t("finance.tipPerPerson")}</p>
                      <p className="text-xl font-bold">{formatCurrency(result.tipPerPerson)}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">{t("finance.totalPerPerson")}</p>
                      <p className="text-xl font-bold">{formatCurrency(result.totalPerPerson)}</p>
                    </div>
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
