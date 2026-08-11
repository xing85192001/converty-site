"use client";

import {
  AlertTriangle,
  Calculator,
  Clock,
  Cpu,
  DollarSign,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
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
  formatBtc,
  formatMiningCurrency,
  getMiningDataAge,
  getMiningLastUpdated,
  HASH_RATE_UNITS,
  MINER_PRESETS,
} from "@/lib/converters/crypto/mining-profitability";
import { useMiningCalculatorStore } from "@/stores/mining-calculator-store";

export function MiningCalculator() {
  const t = useTranslations("calculator.crypto.mining");
  const commonT = useTranslations("common");

  const {
    hashRate,
    hashRateUnit,
    powerWatts,
    electricityCost,
    currency,
    hardwareCost,
    result,
    error,
    setHashRate,
    setHashRateUnit,
    setPowerWatts,
    setElectricityCost,
    setCurrency,
    setHardwareCost,
    applyPreset,
    reset,
  } = useMiningCalculatorStore();

  const dataAge = getMiningDataAge();
  const lastUpdated = getMiningLastUpdated();
  const isStale = dataAge > 24;

  return (
    <div className="space-y-6">
      {/* Educational Disclaimer */}
      <Card className="border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="pt-6 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              {t("disclaimer.title")}
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {t("disclaimer.description")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stale Data Warning */}
      {isStale && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-6 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive mb-1">{t("staleDataTitle")}</p>
              <p className="text-sm text-muted-foreground">{t("staleDataDescription")}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Miner Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            {t("minerPresets")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {MINER_PRESETS.map((preset) => (
            <Button
              key={preset.name}
              variant="outline"
              size="sm"
              onClick={() => applyPreset(preset.hashRate, preset.hashRateUnit, preset.powerWatts)}
              className="gap-2"
            >
              <Cpu className="h-4 w-4" />
              {preset.name}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Input Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {t("miningParameters")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Hash Rate */}
          <div className="space-y-2">
            <Label htmlFor="hashRate">{t("hashRate")}</Label>
            <div className="flex gap-2">
              <Input
                id="hashRate"
                type="number"
                step="any"
                min="0"
                value={hashRate}
                onChange={(e) => setHashRate(e.target.value)}
                placeholder="100"
                className="flex-1"
              />
              <Select value={hashRateUnit} onValueChange={setHashRateUnit}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HASH_RATE_UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Power Consumption */}
          <div className="space-y-2">
            <Label htmlFor="powerWatts">{t("powerConsumption")}</Label>
            <div className="relative">
              <Input
                id="powerWatts"
                type="number"
                step="any"
                min="0"
                value={powerWatts}
                onChange={(e) => setPowerWatts(e.target.value)}
                placeholder="3000"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                W
              </span>
            </div>
          </div>

          {/* Electricity Cost */}
          <div className="space-y-2">
            <Label htmlFor="electricityCost">{t("electricityCost")}</Label>
            <div className="relative">
              <Input
                id="electricityCost"
                type="number"
                step="any"
                min="0"
                value={electricityCost}
                onChange={(e) => setElectricityCost(e.target.value)}
                placeholder="0.27"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {currency}/kWh
              </span>
            </div>
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <Label htmlFor="currency">{t("currency")}</Label>
            <Select
              value={currency}
              onValueChange={(value) => setCurrency(value as typeof currency)}
            >
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CHF">Swiss Franc (CHF)</SelectItem>
                <SelectItem value="EUR">Euro (€)</SelectItem>
                <SelectItem value="USD">US Dollar ($)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Hardware Cost (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="hardwareCost">{t("hardwareCost")} (optional)</Label>
            <div className="relative">
              <Input
                id="hardwareCost"
                type="number"
                step="any"
                min="0"
                value={hardwareCost}
                onChange={(e) => setHardwareCost(e.target.value)}
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {currency}
              </span>
            </div>
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

      {/* Profitability Indicator */}
      {result && !error && (
        <Card
          className={
            result.isProfitable
              ? "border-green-500 bg-green-50/50 dark:bg-green-950/20"
              : "border-red-500 bg-red-50/50 dark:bg-red-950/20"
          }
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {result.isProfitable ? (
                <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-600 dark:text-red-400" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {result.isProfitable ? t("profitable") : t("notProfitable")}
                </p>
                <p className="text-3xl font-bold">
                  <span
                    className={
                      result.isProfitable
                        ? "text-green-700 dark:text-green-300"
                        : "text-red-700 dark:text-red-300"
                    }
                  >
                    {result.profitPerDay >= 0 ? "+" : ""}
                    {formatMiningCurrency(result.profitPerDay, result.currency)} {result.currency}
                  </span>
                  <span className="text-lg text-muted-foreground ml-2">{t("dailyProfit")}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Results */}
      {result && !error && (
        <Card>
          <CardHeader>
            <CardTitle>{t("detailedResults")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Daily Revenue */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                {t("daily")}
              </h3>
              <div className="space-y-2 pl-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Revenue</span>
                  <span className="font-medium">
                    {formatMiningCurrency(result.revenuePerDay, result.currency)} {result.currency}
                    <span className="text-sm text-muted-foreground ml-2">
                      ({formatBtc(result.btcPerDay)} BTC)
                    </span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    {t("electricityCostDaily")}
                  </span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    -{formatMiningCurrency(result.electricityCostPerDay, result.currency)}{" "}
                    {result.currency}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-semibold">Profit</span>
                  <span
                    className={`font-bold ${result.profitPerDay >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                  >
                    {result.profitPerDay >= 0 ? "+" : ""}
                    {formatMiningCurrency(result.profitPerDay, result.currency)} {result.currency}
                  </span>
                </div>
              </div>
            </div>

            {/* Monthly Revenue */}
            <div className="space-y-3">
              <h3 className="font-semibold">{t("monthly")}</h3>
              <div className="space-y-2 pl-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Revenue</span>
                  <span className="font-medium">
                    {formatMiningCurrency(result.revenuePerMonth, result.currency)}{" "}
                    {result.currency}
                    <span className="text-sm text-muted-foreground ml-2">
                      ({formatBtc(result.btcPerMonth)} BTC)
                    </span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Electricity</span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    -{formatMiningCurrency(result.electricityCostPerMonth, result.currency)}{" "}
                    {result.currency}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-semibold">Profit</span>
                  <span
                    className={`font-bold ${result.profitPerMonth >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                  >
                    {result.profitPerMonth >= 0 ? "+" : ""}
                    {formatMiningCurrency(result.profitPerMonth, result.currency)} {result.currency}
                  </span>
                </div>
              </div>
            </div>

            {/* Yearly Revenue */}
            <div className="space-y-3">
              <h3 className="font-semibold">{t("yearly")}</h3>
              <div className="space-y-2 pl-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Revenue</span>
                  <span className="font-medium">
                    {formatMiningCurrency(result.revenuePerYear, result.currency)} {result.currency}
                    <span className="text-sm text-muted-foreground ml-2">
                      ({formatBtc(result.btcPerYear)} BTC)
                    </span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Electricity</span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    -{formatMiningCurrency(result.electricityCostPerYear, result.currency)}{" "}
                    {result.currency}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-semibold">Profit</span>
                  <span
                    className={`font-bold ${result.profitPerYear >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                  >
                    {result.profitPerYear >= 0 ? "+" : ""}
                    {formatMiningCurrency(result.profitPerYear, result.currency)} {result.currency}
                  </span>
                </div>
              </div>
            </div>

            {/* ROI Information (if hardware cost provided) */}
            {result.roiDays !== null && (
              <div className="space-y-3 pt-4 border-t">
                <h3 className="font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Return on Investment
                </h3>
                <div className="space-y-2 pl-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t("roiDays")}</span>
                    <span className="font-medium">
                      {result.roiDays.toFixed(0)} days ({result.roiMonths?.toFixed(1)} months)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{t("breakEvenDate")}</span>
                    <span className="font-medium">
                      {new Date(result.breakEvenDate!).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Network Context */}
            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{t("btcPrice")}</span>
                <span className="font-medium">
                  {formatMiningCurrency(result.btcPrice, result.currency)} {result.currency}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{t("blockReward")}</span>
                <span className="font-medium">{result.blockReward} BTC</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Network Difficulty</span>
                <span className="font-medium">{result.networkDifficulty.toExponential(2)}</span>
              </div>
            </div>

            {/* Data Timestamp */}
            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{t("dataFrom")}: Blockchain.info + CoinGecko</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {t("lastUpdated")}: {new Date(lastUpdated).toLocaleString()} (
                {t("hoursAgo", { hours: dataAge })})
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
