// src/app/[locale]/automotive/tire-sizing/tire-sizing-calculator.tsx
"use client";

import { AlertTriangle, ArrowLeftRight, Calculator, Check, Disc, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCommonTireSizes } from "@/lib/converters/automotive/tire-sizing";
import { type InputMode, useTireSizingStore } from "@/stores/tire-sizing-store";

export function TireSizingCalculator() {
  const t = useTranslations("calculator.automotive.tireSizing");
  const commonT = useTranslations("common");

  const {
    inputMode,
    tire1Notation,
    tire2Notation,
    tire1Width,
    tire1AspectRatio,
    tire1RimDiameter,
    tire1LoadIndex,
    tire1SpeedRating,
    compareMode,
    tire1Result,
    comparisonResult,
    error,
    setInputMode,
    setTire1Notation,
    setTire2Notation,
    setTire1Width,
    setTire1AspectRatio,
    setTire1RimDiameter,
    setTire1LoadIndex,
    setTire1SpeedRating,
    setCompareMode,
    calculate,
    reset,
  } = useTireSizingStore();

  // Calculate on mount with URL params
  useEffect(() => {
    calculate();
  }, [calculate]);

  const commonSizes = getCommonTireSizes();

  return (
    <div className="space-y-6">
      {/* Input Mode Selection */}
      <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as InputMode)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notation">
            <Disc className="h-4 w-4 mr-2" />
            {t("modes.notation")}
          </TabsTrigger>
          <TabsTrigger value="manual">
            <Calculator className="h-4 w-4 mr-2" />
            {t("modes.manual")}
          </TabsTrigger>
        </TabsList>

        {/* Notation Mode */}
        <TabsContent value="notation">
          <Card>
            <CardHeader>
              <CardTitle>{t("input")}</CardTitle>
              <CardDescription>{t("notationDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tire1Notation">{t("tireSize")}</Label>
                <Input
                  id="tire1Notation"
                  value={tire1Notation}
                  onChange={(e) => setTire1Notation(e.target.value.toUpperCase())}
                  placeholder="205/55R16"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {commonSizes.slice(0, 6).map((size) => (
                    <Button
                      key={size}
                      variant="outline"
                      size="sm"
                      onClick={() => setTire1Notation(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manual Mode */}
        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>{t("input")}</CardTitle>
              <CardDescription>{t("manualDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tire1Width">{t("width")}</Label>
                  <Input
                    id="tire1Width"
                    type="number"
                    min="100"
                    max="400"
                    step="5"
                    value={tire1Width}
                    onChange={(e) => setTire1Width(parseInt(e.target.value) || 0)}
                    placeholder="205"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tire1AspectRatio">{t("aspectRatio")}</Label>
                  <Input
                    id="tire1AspectRatio"
                    type="number"
                    min="20"
                    max="100"
                    step="5"
                    value={tire1AspectRatio}
                    onChange={(e) => setTire1AspectRatio(parseInt(e.target.value) || 0)}
                    placeholder="55"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tire1RimDiameter">{t("rimDiameter")}</Label>
                  <Input
                    id="tire1RimDiameter"
                    type="number"
                    min="12"
                    max="24"
                    step="1"
                    value={tire1RimDiameter}
                    onChange={(e) => setTire1RimDiameter(parseInt(e.target.value) || 0)}
                    placeholder="16"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tire1LoadIndex">{t("loadIndex")}</Label>
                  <Input
                    id="tire1LoadIndex"
                    value={tire1LoadIndex}
                    onChange={(e) => setTire1LoadIndex(e.target.value)}
                    placeholder="91"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tire1SpeedRating">{t("speedRating")}</Label>
                  <Select value={tire1SpeedRating} onValueChange={setTire1SpeedRating}>
                    <SelectTrigger id="tire1SpeedRating">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="T">T (190 km/h)</SelectItem>
                      <SelectItem value="H">H (210 km/h)</SelectItem>
                      <SelectItem value="V">V (240 km/h)</SelectItem>
                      <SelectItem value="W">W (270 km/h)</SelectItem>
                      <SelectItem value="Y">Y (300 km/h)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Comparison Mode Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="compareMode">{t("compareMode")}</Label>
              <p className="text-sm text-muted-foreground">{t("compareModeDescription")}</p>
            </div>
            <Switch id="compareMode" checked={compareMode} onCheckedChange={setCompareMode} />
          </div>

          {compareMode && (
            <div className="mt-4 space-y-2">
              <Label htmlFor="tire2Notation">{t("compareTire")}</Label>
              <Input
                id="tire2Notation"
                value={tire2Notation}
                onChange={(e) => setTire2Notation(e.target.value.toUpperCase())}
                placeholder="215/60R16"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {commonSizes.slice(3, 9).map((size) => (
                  <Button
                    key={size}
                    variant="outline"
                    size="sm"
                    onClick={() => setTire2Notation(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
          )}
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
      {tire1Result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Disc className="h-5 w-5" />
              {t("result")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tire Notation Display */}
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{tire1Result.components.notation}</div>
            </div>

            {/* Dimensions Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-muted rounded-md text-center">
                <div className="text-sm text-muted-foreground">{t("sidewallHeight")}</div>
                <div className="text-xl font-semibold">
                  {tire1Result.sidewallHeight.toFixed(1)} mm
                </div>
                <div className="text-sm text-muted-foreground">
                  ({tire1Result.sidewallHeightCm.toFixed(2)} cm)
                </div>
              </div>
              <div className="p-4 bg-muted rounded-md text-center">
                <div className="text-sm text-muted-foreground">{t("overallDiameter")}</div>
                <div className="text-xl font-semibold">
                  {tire1Result.overallDiameter.toFixed(1)} mm
                </div>
                <div className="text-sm text-muted-foreground">
                  ({tire1Result.overallDiameterCm.toFixed(1)} cm)
                </div>
              </div>
              <div className="p-4 bg-muted rounded-md text-center">
                <div className="text-sm text-muted-foreground">{t("circumference")}</div>
                <div className="text-xl font-semibold">
                  {tire1Result.circumference.toFixed(1)} mm
                </div>
              </div>
              <div className="p-4 bg-muted rounded-md text-center">
                <div className="text-sm text-muted-foreground">{t("revolutionsPerKm")}</div>
                <div className="text-xl font-semibold">
                  {tire1Result.revolutionsPerKm.toFixed(0)}
                </div>
              </div>
            </div>

            {/* Load and Speed Ratings */}
            {(tire1Result.maxLoad || tire1Result.maxSpeed) && (
              <div className="grid grid-cols-2 gap-4">
                {tire1Result.maxLoad && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-md">
                    <div className="text-sm text-muted-foreground">{t("loadIndex")}</div>
                    <div className="text-xl font-semibold">{tire1Result.maxLoad} kg</div>
                    <div className="text-sm text-muted-foreground">
                      {tire1Result.loadDescription}
                    </div>
                  </div>
                )}
                {tire1Result.maxSpeed && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-md">
                    <div className="text-sm text-muted-foreground">{t("speedRating")}</div>
                    <div className="text-xl font-semibold">{tire1Result.maxSpeed} km/h</div>
                    <div className="text-sm text-muted-foreground">
                      {tire1Result.speedDescription}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Calculation Steps */}
            <div className="space-y-2">
              <Label>{t("calculationSteps")}</Label>
              <div className="p-4 bg-muted rounded-md text-sm space-y-1">
                {tire1Result.steps.map((step, i) => (
                  <div key={`tire1-step-${i}-${step.slice(0, 20)}`} className="font-mono">
                    {i + 1}. {step}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparison Results */}
      {comparisonResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5" />
              {t("comparisonResult")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tire Comparison Display */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-lg font-bold">
                  {comparisonResult.tire1.components.notation}
                </div>
                <div className="text-sm text-muted-foreground">
                  {comparisonResult.tire1.overallDiameter.toFixed(1)} mm
                </div>
              </div>
              <div className="text-center">
                <ArrowLeftRight className="h-8 w-8 mx-auto text-muted-foreground" />
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-lg font-bold">
                  {comparisonResult.tire2.components.notation}
                </div>
                <div className="text-sm text-muted-foreground">
                  {comparisonResult.tire2.overallDiameter.toFixed(1)} mm
                </div>
              </div>
            </div>

            {/* Difference Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-md text-center">
                <div className="text-sm text-muted-foreground">{t("diameterDifference")}</div>
                <div className="text-xl font-semibold">
                  {comparisonResult.diameterDifferenceMm > 0 ? "+" : ""}
                  {comparisonResult.diameterDifferenceMm.toFixed(1)} mm
                </div>
                <div className="text-sm text-muted-foreground">
                  ({comparisonResult.diameterDifferencePercent > 0 ? "+" : ""}
                  {comparisonResult.diameterDifferencePercent.toFixed(2)}%)
                </div>
              </div>
              <div className="p-4 bg-muted rounded-md text-center">
                <div className="text-sm text-muted-foreground">{t("speedometerError")}</div>
                <div className="text-xl font-semibold">
                  {comparisonResult.speedometerErrorPercent > 0 ? "+" : ""}
                  {comparisonResult.speedometerErrorPercent.toFixed(2)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  100 km/h = {comparisonResult.actualSpeedAt100.toFixed(1)} km/h
                </div>
              </div>
            </div>

            {/* Tolerance Check */}
            <div
              className={`p-4 rounded-md ${
                comparisonResult.withinTolerance
                  ? "bg-green-50 dark:bg-green-950"
                  : "bg-yellow-50 dark:bg-yellow-950"
              }`}
            >
              <div className="flex items-center gap-2">
                {comparisonResult.withinTolerance ? (
                  <>
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-600">{t("withinTolerance")}</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium text-yellow-600">{t("exceedsTolerance")}</span>
                  </>
                )}
              </div>
              {comparisonResult.warning && (
                <p className="mt-2 text-sm text-muted-foreground">{comparisonResult.warning}</p>
              )}
            </div>

            {/* Comparison Steps */}
            <div className="space-y-2">
              <Label>{t("calculationSteps")}</Label>
              <div className="p-4 bg-muted rounded-md text-sm space-y-1">
                {comparisonResult.steps.map((step, i) => (
                  <div key={`comparison-step-${i}-${step.slice(0, 20)}`} className="font-mono">
                    {i + 1}. {step}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reset Button */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={reset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          {commonT("reset")}
        </Button>
      </div>
    </div>
  );
}
