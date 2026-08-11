"use client";

import { Activity, Info, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { InputField, OutputDisplay, ResultGrid } from "@/components/converter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FILE_SIZE_UNITS } from "@/lib/converters/data/download-calculator";
import { TIME_UNITS } from "@/lib/converters/network/throughput-calculator";
import { useThroughputCalculatorStore } from "@/stores/throughput-calculator-store";

export function ThroughputCalculator() {
  const t = useTranslations("calculator.network");
  const tDataUnits = useTranslations("calculator.data.units");
  const {
    dataSize,
    dataSizeUnit,
    transferTime,
    transferTimeUnit,
    result,
    error,
    setDataSize,
    setDataSizeUnit,
    setTransferTime,
    setTransferTimeUnit,
    reset,
  } = useThroughputCalculatorStore();

  // Format comparison text
  const getComparisonText = () => {
    if (!result) return "";
    const ratio = result.comparisonRatio;
    const speedName = t(`speedReferences.${result.comparison}`);

    if (ratio > 0.9 && ratio < 1.1) {
      return t("comparisonApprox", { speed: speedName });
    } else if (ratio < 1) {
      return t("comparisonPercent", { percent: (ratio * 100).toFixed(0), speed: speedName });
    } else {
      return t("comparisonTimes", { times: ratio.toFixed(1), speed: speedName });
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {t("throughputInput")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Data Size */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              id="dataSize"
              label={t("dataSize")}
              value={dataSize}
              onChange={setDataSize}
              type="number"
              min="0"
              step="any"
              placeholder="100"
            />
            <div className="space-y-2">
              <Label htmlFor="dataSizeUnit">{t("dataSizeUnit")}</Label>
              <Select value={dataSizeUnit} onValueChange={setDataSizeUnit}>
                <SelectTrigger id="dataSizeUnit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FILE_SIZE_UNITS.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {tDataUnits(u.id as any)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Transfer Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              id="transferTime"
              label={t("transferTime")}
              value={transferTime}
              onChange={setTransferTime}
              type="number"
              min="0"
              step="any"
              placeholder="10"
            />
            <div className="space-y-2">
              <Label htmlFor="transferTimeUnit">{t("transferTimeUnit")}</Label>
              <Select value={transferTimeUnit} onValueChange={setTransferTimeUnit}>
                <SelectTrigger id="transferTimeUnit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_UNITS.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {t(`timeUnits.${u.id}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {result && (
        <>
          {/* Throughput Conversions */}
          <Card>
            <CardHeader>
              <CardTitle>{t("throughputResults")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResultGrid
                results={result.conversions.map((c) => ({
                  label: c.unit,
                  value: c.formatted,
                }))}
              />
            </CardContent>
          </Card>

          {/* Speed Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                {t("speedComparison")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OutputDisplay label={t("comparedTo")} value={getComparisonText()} />
            </CardContent>
          </Card>

          {/* Calculation Steps */}
          <Card>
            <CardHeader>
              <CardTitle>{t("calculationSteps")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-mono text-sm">
                {result.steps.map((step) => (
                  <p key={step} className="text-muted-foreground">
                    {step}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Reset Button */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={reset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          {t("reset")}
        </Button>
      </div>
    </div>
  );
}
