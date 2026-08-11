"use client";

import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { InputField, OutputDisplay } from "@/components/converter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  calculateDilution,
  type DilutionInput,
  type DilutionResult,
} from "@/lib/converters/chemistry/dilution";
import { createCalculatorStore } from "@/stores/calculator-store";

const useDilutionStore = createCalculatorStore<DilutionInput, DilutionResult>({
  name: "dilution",
  initialValues: {
    mode: "find-V1",
    initialMolarity: 1,
    finalMolarity: 0.2,
    initialVolume: 100,
    initialVolumeUnit: "mL",
    finalVolume: 500,
    finalVolumeUnit: "mL",
  },
  calculate: calculateDilution,
});

export default function DilutionCalculator() {
  const t = useTranslations("calculator.chemistry");
  const tSections = useTranslations("calculator.sections");
  const tModes = useTranslations("calculator.chemistry.modes");

  const { values, setValue, result, calculationError } = useDilutionStore();

  const showInitialVolume = values.mode === "find-V2" || values.mode === "find-M2";
  const showFinalVolume = values.mode === "find-V1" || values.mode === "find-M2";
  const showFinalMolarity = values.mode === "find-V1" || values.mode === "find-V2";

  return (
    <div className="space-y-6">
      {/* Formula Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-2xl font-semibold mb-2">M₁V₁ = M₂V₂</p>
            <p className="text-sm text-muted-foreground">{t("dilutionFormula")}</p>
          </div>
        </CardContent>
      </Card>

      {/* Calculation Mode */}
      <Card>
        <CardHeader>
          <CardTitle>{t("mode")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={values.mode}
            onValueChange={(v) => setValue("mode", v as DilutionInput["mode"])}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="find-V1">{tModes("findV1")}</TabsTrigger>
              <TabsTrigger value="find-V2">{tModes("findV2")}</TabsTrigger>
              <TabsTrigger value="find-M2">{tModes("findM2")}</TabsTrigger>
            </TabsList>
          </Tabs>
          <p className="mt-3 text-sm text-muted-foreground">
            {values.mode === "find-V1" && t("modeDescriptions.findV1")}
            {values.mode === "find-V2" && t("modeDescriptions.findV2")}
            {values.mode === "find-M2" && t("modeDescriptions.findM2")}
          </p>
        </CardContent>
      </Card>

      {/* Inputs */}
      <Card>
        <CardHeader>
          <CardTitle>{tSections("input")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Initial Molarity */}
            <InputField
              id="initialMolarity"
              label={t("labels.initialMolarity")}
              value={values.initialMolarity.toString()}
              onChange={(v) => setValue("initialMolarity", parseFloat(v) || 0)}
              min={0}
              step="0.001"
              unit="M"
            />

            {/* Initial Volume */}
            {showInitialVolume && (
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  id="initialVolume"
                  label={t("labels.initialVolume")}
                  value={values.initialVolume?.toString() || ""}
                  onChange={(v) => setValue("initialVolume", parseFloat(v) || 0)}
                  min={0}
                  step="0.001"
                />
                <div className="space-y-2">
                  <Label htmlFor="initialVolumeUnit">{t("labels.volumeUnit")}</Label>
                  <Select
                    value={values.initialVolumeUnit}
                    onValueChange={(v) =>
                      setValue("initialVolumeUnit", v as DilutionInput["initialVolumeUnit"])
                    }
                  >
                    <SelectTrigger id="initialVolumeUnit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">L (liters)</SelectItem>
                      <SelectItem value="mL">mL (milliliters)</SelectItem>
                      <SelectItem value="µL">µL (microliters)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Final Molarity */}
            {showFinalMolarity && (
              <InputField
                id="finalMolarity"
                label={t("labels.finalMolarity")}
                value={values.finalMolarity?.toString() || ""}
                onChange={(v) => setValue("finalMolarity", parseFloat(v) || 0)}
                min={0}
                step="0.001"
                unit="M"
              />
            )}

            {/* Final Volume */}
            {showFinalVolume && (
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  id="finalVolume"
                  label={t("labels.finalVolume")}
                  value={values.finalVolume?.toString() || ""}
                  onChange={(v) => setValue("finalVolume", parseFloat(v) || 0)}
                  min={0}
                  step="0.001"
                />
                <div className="space-y-2">
                  <Label htmlFor="finalVolumeUnit">{t("labels.volumeUnit")}</Label>
                  <Select
                    value={values.finalVolumeUnit}
                    onValueChange={(v) =>
                      setValue("finalVolumeUnit", v as DilutionInput["finalVolumeUnit"])
                    }
                  >
                    <SelectTrigger id="finalVolumeUnit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">L (liters)</SelectItem>
                      <SelectItem value="mL">mL (milliliters)</SelectItem>
                      <SelectItem value="µL">µL (microliters)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <>
          {/* Safety Warning */}
          {result.safetyWarning && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950 p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  {result.safetyWarning}
                </p>
              </div>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>{tSections("results")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <OutputDisplay
                  label={t("labels.initialMolarity")}
                  value={result.initialMolarity.toFixed(6)}
                  unit="M"
                  size="lg"
                />
                <OutputDisplay
                  label={t("labels.finalMolarity")}
                  value={result.finalMolarity.toFixed(6)}
                  unit="M"
                  size="lg"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border bg-card p-4 text-card-foreground">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {t("labels.initialVolume")}
                  </p>
                  <p className="text-lg font-semibold font-mono">
                    {result.initialVolumeL.toFixed(6)}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">L</span>
                  </p>
                </div>

                <div className="rounded-lg border bg-card p-4 text-card-foreground">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {t("labels.finalVolume")}
                  </p>
                  <p className="text-lg font-semibold font-mono">
                    {result.finalVolumeL.toFixed(6)}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">L</span>
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border bg-primary/5 border-primary/20 p-4">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {t("dilutionFactor")}
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {result.dilutionFactor.toFixed(2)}×
                  </p>
                </div>

                <div className="rounded-lg border bg-primary/5 border-primary/20 p-4">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {t("solventToAdd")}
                  </p>
                  <p className="text-2xl font-bold text-primary">{result.formattedSolvent}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calculation Steps */}
          {result.steps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t("calculationSteps")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  {result.steps.map((step, index) => (
                    <li key={index} className="text-muted-foreground">
                      {step}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {calculationError && <p className="mt-2 text-sm text-destructive">{calculationError}</p>}
    </div>
  );
}
