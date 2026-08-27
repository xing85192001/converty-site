"use client";

import { Clock, Info, RotateCcw } from "lucide-react";
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
import { LATENCY_UNITS } from "@/lib/converters/network/latency-converter";
import { useLatencyConverterStore } from "@/stores/latency-converter-store";

export function LatencyConverter() {
  const t = useTranslations("calculator.network");
  const tCommon = useTranslations("common");
  const { value, unit, result, error, setValue, setUnit, reset } = useLatencyConverterStore();

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t("latencyInput")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              id="latencyValue"
              label={t("latencyValue")}
              value={value}
              onChange={setValue}
              type="number"
              min="0"
              step="any"
              placeholder="100"
            />
            <div className="space-y-2">
              <Label htmlFor="latencyUnit">{t("latencyUnit")}</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger id="latencyUnit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LATENCY_UNITS.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {t(`units.${u.id}`)} ({u.id === "us" ? "\u03BCs" : u.abbreviation})
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
          {/* Conversions */}
          <Card>
            <CardHeader>
              <CardTitle>{t("conversions")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResultGrid
                results={result.conversions.map((c) => ({
                  label: t(`units.${c.unit.id}`),
                  value: `${c.formatted} ${c.unit.id === "us" ? "\u03BCs" : c.unit.abbreviation}`,
                }))}
              />
            </CardContent>
          </Card>

          {/* Latency Context */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                {t("latencyContext")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <OutputDisplay label={t("category")} value={t(`categories.${result.category}`)} />
              <OutputDisplay
                label={t("typicalUseCase")}
                value={t(`useCases.${result.typicalUseCase}`)}
              />
            </CardContent>
          </Card>
        </>
      )}

      {/* Reset Button */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={reset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          {tCommon("reset")}
        </Button>
      </div>
    </div>
  );
}
