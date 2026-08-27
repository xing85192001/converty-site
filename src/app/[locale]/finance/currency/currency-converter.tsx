"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type CurrencyResult,
  convertCurrency,
  getAvailableCurrencies,
} from "@/lib/converters/finance/currency";

export function CurrencyConverter() {
  const t = useTranslations("calculator");
  const tCurrencies = useTranslations("calculator.finance.currencies");
  const format = useFormatter();

  const [amount, setAmount] = useState<number>(100);
  const [fromCurrency, setFromCurrency] = useState<string>("CHF");
  const [toCurrency, setToCurrency] = useState<string>("EUR");

  const currencies = getAvailableCurrencies();
  const calcResult = convertCurrency({
    amount,
    fromCurrency,
    toCurrency,
  });
  const result = calcResult.ok ? calcResult.value : null;

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t("sections.input")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">{t("labels.amount")}</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fromCurrency">{t("labels.from")}</Label>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code} - {tCurrencies(code as any)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={swapCurrencies}
              className="p-2 rounded-full border hover:bg-accent"
              title={t("labels.swapCurrencies")}
            >
              ⇅
            </button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="toCurrency">{t("labels.to")}</Label>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code} - {tCurrencies(code as any)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                  {format.number(amount)} {fromCurrency} =
                </p>
                <p className="text-3xl font-bold">
                  {format.number(result.convertedAmount, { maximumFractionDigits: 2 })} {toCurrency}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">{t("labels.exchangeRate")}</p>
                  <p className="text-lg font-medium">
                    1 {fromCurrency} ={" "}
                    {format.number(result.exchangeRate, { maximumFractionDigits: 4 })} {toCurrency}
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">{t("labels.inverseRate")}</p>
                  <p className="text-lg font-medium">
                    1 {toCurrency} ={" "}
                    {format.number(result.inverseRate, { maximumFractionDigits: 4 })} {fromCurrency}
                  </p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">{t("labels.exchangeRateNote")}</p>
            </div>
          ) : (
            <p className="text-muted-foreground">{t("labels.enterValuesToConvert")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
