"use client";

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
  calculateMolarity,
  type MolarityInput,
  type MolarityResult,
} from "@/lib/converters/chemistry/molarity";
import { createCalculatorStore } from "@/stores/calculator-store";

const useMolarityStore = createCalculatorStore<MolarityInput, MolarityResult>({
  name: "molarity",
  initialValues: {
    mode: "mass-volume",
    mass: 58.44,
    molecularWeight: 58.44,
    moles: 1,
    volume: 1,
    volumeUnit: "L",
  },
  calculate: calculateMolarity,
});

export default function MolarityCalculator() {
  const t = useTranslations("calculator.chemistry");
  const tSections = useTranslations("calculator.sections");
  const tModes = useTranslations("calculator.chemistry.modes");

  const { values, setValue, result, calculationError } = useMolarityStore();

  return (
    <div className="space-y-6">
      {/* Calculation Mode */}
      <Card>
        <CardHeader>
          <CardTitle>{t("mode")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={values.mode}
            onValueChange={(v) => setValue("mode", v as MolarityInput["mode"])}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mass-volume">{tModes("massVolume")}</TabsTrigger>
              <TabsTrigger value="moles-volume">{tModes("molesVolume")}</TabsTrigger>
            </TabsList>
          </Tabs>
          <p className="mt-3 text-sm text-muted-foreground">
            {values.mode === "mass-volume"
              ? t("modeDescriptions.massVolume")
              : t("modeDescriptions.molesVolume")}
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
            {values.mode === "mass-volume" && (
              <>
                <InputField
                  id="mass"
                  label={t("labels.mass")}
                  value={values.mass?.toString() || ""}
                  onChange={(v) => setValue("mass", parseFloat(v) || 0)}
                  min={0}
                  step="0.001"
                  unit="g"
                />
                <InputField
                  id="molecularWeight"
                  label={t("labels.molecularWeight")}
                  value={values.molecularWeight?.toString() || ""}
                  onChange={(v) => setValue("molecularWeight", parseFloat(v) || 0)}
                  min={0}
                  step="0.001"
                  unit="g/mol"
                />
              </>
            )}

            {values.mode === "moles-volume" && (
              <InputField
                id="moles"
                label={t("labels.moles")}
                value={values.moles?.toString() || ""}
                onChange={(v) => setValue("moles", parseFloat(v) || 0)}
                min={0}
                step="0.001"
                unit="mol"
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <InputField
                id="volume"
                label={t("labels.volume")}
                value={values.volume.toString()}
                onChange={(v) => setValue("volume", parseFloat(v) || 0)}
                min={0}
                step="0.001"
              />
              <div className="space-y-2">
                <Label htmlFor="volumeUnit">{t("labels.volumeUnit")}</Label>
                <Select
                  value={values.volumeUnit}
                  onValueChange={(v) => setValue("volumeUnit", v as MolarityInput["volumeUnit"])}
                >
                  <SelectTrigger id="volumeUnit">
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
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{tSections("results")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <OutputDisplay
                label={t("labels.molarity")}
                value={result.formatted}
                unit="M (mol/L)"
                size="lg"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border bg-card p-4 text-card-foreground">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {t("labels.moles")}
                  </p>
                  <p className="text-lg font-semibold font-mono">
                    {result.moles.toFixed(6)}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">mol</span>
                  </p>
                </div>

                <div className="rounded-lg border bg-card p-4 text-card-foreground">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {t("labels.volume")}
                  </p>
                  <p className="text-lg font-semibold font-mono">
                    {result.volumeL.toFixed(6)}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">L</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Concentration Units */}
          <Card>
            <CardHeader>
              <CardTitle>{t("concentrationUnits")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border bg-muted/50 p-3">
                  <p className="text-sm font-medium text-muted-foreground">M (mol/L)</p>
                  <p className="text-xl font-semibold">{result.concentrationUnits.M.toFixed(6)}</p>
                </div>
                <div className="rounded-lg border bg-muted/50 p-3">
                  <p className="text-sm font-medium text-muted-foreground">mM (mmol/L)</p>
                  <p className="text-xl font-semibold">{result.concentrationUnits.mM.toFixed(3)}</p>
                </div>
                <div className="rounded-lg border bg-muted/50 p-3">
                  <p className="text-sm font-medium text-muted-foreground">µM (µmol/L)</p>
                  <p className="text-xl font-semibold">{result.concentrationUnits.µM.toFixed(3)}</p>
                </div>
                <div className="rounded-lg border bg-muted/50 p-3">
                  <p className="text-sm font-medium text-muted-foreground">nM (nmol/L)</p>
                  <p className="text-xl font-semibold">{result.concentrationUnits.nM.toFixed(3)}</p>
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
