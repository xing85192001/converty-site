"use client";

import { Calculator, Car, Fuel, RotateCcw, TrendingDown } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CalculationMode } from "@/lib/converters/automotive/fuel-efficiency";
import type { Currency } from "@/lib/converters/automotive/types";
import { useFuelEfficiencyStore } from "@/stores/fuel-efficiency-store";

export function FuelEfficiencyCalculator() {
  const t = useTranslations("calculator.automotive.fuelEfficiency");
  const commonT = useTranslations("common");

  const {
    mode,
    distanceKm,
    fuelLiters,
    tripDistanceKm,
    consumptionLPer100km,
    vehicle1LPer100km,
    vehicle2LPer100km,
    fuelPricePerLiter,
    currency,
    annualDistanceKm,
    result,
    error,
    setMode,
    setDistanceKm,
    setFuelLiters,
    setTripDistanceKm,
    setConsumptionLPer100km,
    setVehicle1LPer100km,
    setVehicle2LPer100km,
    setFuelPricePerLiter,
    setCurrency,
    setAnnualDistanceKm,
    calculate,
    reset,
  } = useFuelEfficiencyStore();

  // Calculate on mount with URL params
  useEffect(() => {
    calculate();
  }, [calculate]);

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "excellent":
        return "text-green-600";
      case "good":
        return "text-blue-600";
      case "average":
        return "text-yellow-600";
      case "poor":
        return "text-red-600";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <Tabs value={mode} onValueChange={(v) => setMode(v as CalculationMode)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="consumption">
            <Fuel className="h-4 w-4 mr-2" />
            {t("modes.consumption")}
          </TabsTrigger>
          <TabsTrigger value="tripPlanning">
            <Car className="h-4 w-4 mr-2" />
            {t("modes.tripPlanning")}
          </TabsTrigger>
          <TabsTrigger value="comparison">
            <TrendingDown className="h-4 w-4 mr-2" />
            {t("modes.comparison")}
          </TabsTrigger>
        </TabsList>

        {/* Consumption Mode */}
        <TabsContent value="consumption">
          <Card>
            <CardHeader>
              <CardTitle>{t("input")}</CardTitle>
              <CardDescription>{t("consumptionDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="distanceKm">{t("distanceTraveled")}</Label>
                  <Input
                    id="distanceKm"
                    type="number"
                    min="0"
                    step="1"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(parseFloat(e.target.value) || 0)}
                    placeholder="500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fuelLiters">{t("fuelUsed")}</Label>
                  <Input
                    id="fuelLiters"
                    type="number"
                    min="0"
                    step="0.1"
                    value={fuelLiters}
                    onChange={(e) => setFuelLiters(parseFloat(e.target.value) || 0)}
                    placeholder="40"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trip Planning Mode */}
        <TabsContent value="tripPlanning">
          <Card>
            <CardHeader>
              <CardTitle>{t("input")}</CardTitle>
              <CardDescription>{t("tripPlanningDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tripDistanceKm">{t("tripDistance")}</Label>
                  <Input
                    id="tripDistanceKm"
                    type="number"
                    min="0"
                    step="1"
                    value={tripDistanceKm}
                    onChange={(e) => setTripDistanceKm(parseFloat(e.target.value) || 0)}
                    placeholder="300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="consumptionLPer100km">{t("consumption")}</Label>
                  <Input
                    id="consumptionLPer100km"
                    type="number"
                    min="0"
                    step="0.1"
                    value={consumptionLPer100km}
                    onChange={(e) => setConsumptionLPer100km(parseFloat(e.target.value) || 0)}
                    placeholder="7.5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparison Mode */}
        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>{t("input")}</CardTitle>
              <CardDescription>{t("comparisonDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicle1LPer100km">{t("vehicle1")}</Label>
                  <Input
                    id="vehicle1LPer100km"
                    type="number"
                    min="0"
                    step="0.1"
                    value={vehicle1LPer100km}
                    onChange={(e) => setVehicle1LPer100km(parseFloat(e.target.value) || 0)}
                    placeholder="8"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicle2LPer100km">{t("vehicle2")}</Label>
                  <Input
                    id="vehicle2LPer100km"
                    type="number"
                    min="0"
                    step="0.1"
                    value={vehicle2LPer100km}
                    onChange={(e) => setVehicle2LPer100km(parseFloat(e.target.value) || 0)}
                    placeholder="6"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Cost Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t("costSettings")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">{t("currency")}</Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CHF">{t("currencies.chf")}</SelectItem>
                  <SelectItem value="EUR">{t("currencies.eur")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fuelPricePerLiter">{t("fuelPrice")}</Label>
              <Input
                id="fuelPricePerLiter"
                type="number"
                min="0"
                step="0.01"
                value={fuelPricePerLiter}
                onChange={(e) => setFuelPricePerLiter(parseFloat(e.target.value) || 0)}
                placeholder="1.85"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="annualDistanceKm">{t("annualDistance")}</Label>
              <Input
                id="annualDistanceKm"
                type="number"
                min="0"
                step="1000"
                value={annualDistanceKm}
                onChange={(e) => setAnnualDistanceKm(parseFloat(e.target.value) || 0)}
                placeholder="15000"
              />
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              {t("result")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primary Result */}
            <div className="text-center p-6 bg-muted rounded-lg">
              <div className="text-4xl font-bold mb-2">{result.formatted.lPer100km}</div>
              <div className={`text-lg font-medium ${getRatingColor(result.rating)}`}>
                {t(`ratings.${result.rating}`)}
              </div>
            </div>

            {/* Conversions Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-md text-center">
                <div className="text-sm text-muted-foreground">{t("kmPerL")}</div>
                <div className="text-xl font-semibold">{result.kmPerL.toFixed(2)}</div>
              </div>
              <div className="p-4 bg-muted rounded-md text-center">
                <div className="text-sm text-muted-foreground">{t("mpgUS")}</div>
                <div className="text-xl font-semibold">{result.mpgUS.toFixed(1)}</div>
              </div>
              <div className="p-4 bg-muted rounded-md text-center">
                <div className="text-sm text-muted-foreground">{t("mpgUK")}</div>
                <div className="text-xl font-semibold">{result.mpgUK.toFixed(1)}</div>
              </div>
            </div>

            {/* Cost Results */}
            {result.costPer100km !== undefined && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-md">
                  <div className="text-sm text-muted-foreground">{t("costPer100km")}</div>
                  <div className="text-xl font-semibold">{result.formatted.costPer100km}</div>
                </div>
                {result.annualCost !== undefined && (
                  <div className="p-4 bg-muted rounded-md">
                    <div className="text-sm text-muted-foreground">{t("annualCost")}</div>
                    <div className="text-xl font-semibold">{result.formatted.annualCost}</div>
                  </div>
                )}
              </div>
            )}

            {/* Trip Planning Results */}
            {mode === "tripPlanning" && result.tripFuelNeeded !== undefined && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-md">
                  <div className="text-sm text-muted-foreground">{t("tripFuel")}</div>
                  <div className="text-xl font-semibold">{result.formatted.tripFuelNeeded}</div>
                </div>
                {result.tripCost !== undefined && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-md">
                    <div className="text-sm text-muted-foreground">{t("tripCost")}</div>
                    <div className="text-xl font-semibold">{result.formatted.tripCost}</div>
                  </div>
                )}
              </div>
            )}

            {/* Comparison Results */}
            {mode === "comparison" && result.moreEfficientVehicle !== undefined && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-md text-center">
                  <div className="text-sm text-muted-foreground">{t("moreEfficient")}</div>
                  <div className="text-xl font-semibold">
                    {t("vehicleNumber", { number: result.moreEfficientVehicle })}
                  </div>
                </div>
                {result.savingsPer100km !== undefined && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-md">
                      <div className="text-sm text-muted-foreground">{t("savingsPer100km")}</div>
                      <div className="text-xl font-semibold">
                        {result.formatted.savingsPer100km}
                      </div>
                    </div>
                    <div className="p-4 bg-muted rounded-md">
                      <div className="text-sm text-muted-foreground">{t("annualSavings")}</div>
                      <div className="text-xl font-semibold">{result.formatted.annualSavings}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Calculation Steps */}
            <div className="space-y-2">
              <Label>{t("calculationSteps")}</Label>
              <div className="p-4 bg-muted rounded-md text-sm space-y-1">
                {result.steps.map((step, i) => (
                  <div key={`step-${i}-${step.slice(0, 20)}`} className="font-mono">
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
