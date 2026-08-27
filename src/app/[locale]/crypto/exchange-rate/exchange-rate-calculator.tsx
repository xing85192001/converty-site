"use client";

import { AlertTriangle, ArrowRightLeft, Clock, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
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
  CRYPTO_CURRENCIES,
  FIAT_CURRENCIES,
  formatCurrency,
  getPriceAge,
  isPriceStale,
} from "@/lib/converters/crypto/exchange-rate";
import { useExchangeRateStore } from "@/stores/exchange-rate-store";

export function ExchangeRateCalculator() {
  const t = useTranslations("calculator.crypto.exchange");
  const commonT = useTranslations("common");

  const { amount, crypto, fiat, result, error, setAmount, setCrypto, setFiat, reset } =
    useExchangeRateStore();

  const isStale = isPriceStale();
  const priceAge = getPriceAge();

  return (
    <div className="space-y-6">
      {/* Stale Price Warning */}
      {isStale && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-6 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive mb-1">{t("stalePriceTitle")}</p>
              <p className="text-sm text-muted-foreground">{t("stalePriceDescription")}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Input Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            {t("convert")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">{t("amount")}</Label>
            <Input
              id="amount"
              type="number"
              step="any"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1.0"
            />
          </div>

          {/* Cryptocurrency Selector */}
          <div className="space-y-2">
            <Label htmlFor="crypto">{t("cryptocurrency")}</Label>
            <Select value={crypto} onValueChange={(value) => setCrypto(value as typeof crypto)}>
              <SelectTrigger id="crypto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CRYPTO_CURRENCIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({c.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fiat Currency Selector */}
          <div className="space-y-2">
            <Label htmlFor="fiat">{t("fiatCurrency")}</Label>
            <Select value={fiat} onValueChange={(value) => setFiat(value as typeof fiat)}>
              <SelectTrigger id="fiat">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FIAT_CURRENCIES.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name} ({f.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results Card */}
      {result && !error && (
        <Card>
          <CardHeader>
            <CardTitle>{t("result")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Conversion Result */}
            <div className="p-6 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground mb-2">
                {result.amount} {result.crypto} =
              </p>
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(result.convertedAmount, result.fiat)} {result.fiat}
              </p>
            </div>

            {/* Exchange Rates */}
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                <span className="text-sm text-muted-foreground">{t("exchangeRate")}</span>
                <span className="font-medium">
                  1 {result.crypto} = {formatCurrency(result.rate, result.fiat)} {result.fiat}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-muted/50 rounded">
                <span className="text-sm text-muted-foreground">{t("inverseRate")}</span>
                <span className="font-medium">
                  1 {result.fiat} = {formatCurrency(result.inverseRate, result.crypto)}{" "}
                  {result.crypto}
                </span>
              </div>
            </div>

            {/* Data Source and Timestamp */}
            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {t("priceDataFrom")}:{" "}
                  {result.source === "coingecko" ? "CoinGecko" : t("fallback")}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {t("lastUpdated")}: {new Date(result.lastUpdated).toLocaleString()} (
                {t("hoursAgo", { hours: priceAge })})
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reset Button */}
      <div className="flex justify-center">
        <Button variant="outline" onClick={reset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          {commonT("reset")}
        </Button>
      </div>
    </div>
  );
}
