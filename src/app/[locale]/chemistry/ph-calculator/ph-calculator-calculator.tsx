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
import acidsBasesData from "@/data/chemistry/acids-bases.json";
import { calculatePh, type PhInput, type PhResult } from "@/lib/converters/chemistry/ph-calculator";
import { createCalculatorStore } from "@/stores/calculator-store";
import { PhScaleSvg } from "./PhScaleSvg";

const usePhStore = createCalculatorStore<PhInput, PhResult>({
  name: "ph-calculator",
  initialValues: {
    mode: "from-ph",
    ph: 7,
  },
  calculate: calculatePh,
});

export default function PhCalculatorCalculator() {
  const t = useTranslations("calculator.chemistry");
  const tSections = useTranslations("calculator.sections");
  const tModes = useTranslations("calculator.chemistry.phModes");

  const { values, setValue, result, calculationError } = usePhStore();

  const acids = acidsBasesData.filter((c) => c.type === "acid");

  return (
    <div className="space-y-6">
      {/* Calculation Mode */}
      <Card>
        <CardHeader>
          <CardTitle>{t("mode")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={values.mode} onValueChange={(v) => setValue("mode", v as PhInput["mode"])}>
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
              <TabsTrigger value="from-ph">{tModes("fromPh")}</TabsTrigger>
              <TabsTrigger value="from-h-concentration">{tModes("fromH")}</TabsTrigger>
              <TabsTrigger value="strong-acid">{tModes("strongAcid")}</TabsTrigger>
              <TabsTrigger value="buffer">{tModes("buffer")}</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Inputs */}
      <Card>
        <CardHeader>
          <CardTitle>{tSections("input")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {values.mode === "from-ph" && (
              <InputField
                id="ph"
                label={t("labels.ph")}
                value={values.ph?.toString() || ""}
                onChange={(v) => setValue("ph", parseFloat(v) || 0)}
                min={0}
                max={14}
                step="0.01"
              />
            )}

            {values.mode === "from-poh" && (
              <InputField
                id="poh"
                label={t("labels.poh")}
                value={values.poh?.toString() || ""}
                onChange={(v) => setValue("poh", parseFloat(v) || 0)}
                min={0}
                max={14}
                step="0.01"
              />
            )}

            {values.mode === "from-h-concentration" && (
              <InputField
                id="hConcentration"
                label={t("labels.hConcentration")}
                value={values.hConcentration?.toString() || ""}
                onChange={(v) => setValue("hConcentration", parseFloat(v) || 0)}
                min={0}
                step="0.0001"
                unit="M"
              />
            )}

            {values.mode === "from-oh-concentration" && (
              <InputField
                id="ohConcentration"
                label={t("labels.ohConcentration")}
                value={values.ohConcentration?.toString() || ""}
                onChange={(v) => setValue("ohConcentration", parseFloat(v) || 0)}
                min={0}
                step="0.0001"
                unit="M"
              />
            )}

            {(values.mode === "strong-acid" || values.mode === "strong-base") && (
              <InputField
                id="concentration"
                label={t("labels.concentration")}
                value={values.concentration?.toString() || ""}
                onChange={(v) => setValue("concentration", parseFloat(v) || 0)}
                min={0}
                step="0.001"
                unit="M"
              />
            )}

            {values.mode === "weak-acid" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="compound">{t("selectAcid")}</Label>
                  <Select
                    value={values.compound || "custom"}
                    onValueChange={(v) => setValue("compound", v === "custom" ? undefined : v)}
                  >
                    <SelectTrigger id="compound">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">{t("customPka")}</SelectItem>
                      {acids.map((acid) => (
                        <SelectItem key={acid.id} value={acid.id}>
                          {acid.name} (pKa = {acid.pka?.toFixed(2) ?? "N/A"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {!values.compound && (
                  <InputField
                    id="pka"
                    label={t("labels.pka")}
                    value={values.pka?.toString() || ""}
                    onChange={(v) => setValue("pka", parseFloat(v) || 0)}
                    min={0}
                    step="0.01"
                  />
                )}

                <InputField
                  id="concentration"
                  label={t("labels.concentration")}
                  value={values.concentration?.toString() || ""}
                  onChange={(v) => setValue("concentration", parseFloat(v) || 0)}
                  min={0}
                  step="0.001"
                  unit="M"
                />
              </>
            )}

            {values.mode === "buffer" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="compound">{t("selectAcid")}</Label>
                  <Select
                    value={values.compound || "custom"}
                    onValueChange={(v) => setValue("compound", v === "custom" ? undefined : v)}
                  >
                    <SelectTrigger id="compound">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">{t("customPka")}</SelectItem>
                      {acids.map((acid) => (
                        <SelectItem key={acid.id} value={acid.id}>
                          {acid.name} (pKa = {acid.pka?.toFixed(2) ?? "N/A"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {!values.compound && (
                  <InputField
                    id="pka"
                    label={t("labels.pka")}
                    value={values.pka?.toString() || ""}
                    onChange={(v) => setValue("pka", parseFloat(v) || 0)}
                    min={0}
                    step="0.01"
                  />
                )}

                <InputField
                  id="acidConcentration"
                  label={t("labels.acidConcentration")}
                  value={values.acidConcentration?.toString() || ""}
                  onChange={(v) => setValue("acidConcentration", parseFloat(v) || 0)}
                  min={0}
                  step="0.001"
                  unit="M"
                />

                <InputField
                  id="baseConcentration"
                  label={t("labels.baseConcentration")}
                  value={values.baseConcentration?.toString() || ""}
                  onChange={(v) => setValue("baseConcentration", parseFloat(v) || 0)}
                  min={0}
                  step="0.001"
                  unit="M"
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <>
          {/* pH Scale Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>{t("phScale")}</CardTitle>
            </CardHeader>
            <CardContent>
              <PhScaleSvg ph={result.ph} />
              <div className="mt-4 text-center">
                <p className="text-lg font-medium" style={{ color: result.color }}>
                  {t(`solutionType.${result.solutionType}`)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Values */}
          <Card>
            <CardHeader>
              <CardTitle>{tSections("results")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.compoundName && (
                <div className="rounded-lg border bg-muted/50 p-3 text-center">
                  <p className="text-sm text-muted-foreground">{t("compound")}</p>
                  <p className="text-lg font-semibold">{result.compoundName}</p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <OutputDisplay label={t("labels.ph")} value={result.ph.toFixed(2)} size="lg" />
                <OutputDisplay label={t("labels.poh")} value={result.poh.toFixed(2)} size="lg" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border bg-card p-4 text-card-foreground">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {t("labels.hConcentration")}
                  </p>
                  <p className="text-lg font-semibold font-mono">
                    {result.hConcentration.toExponential(3)}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">M</span>
                  </p>
                </div>

                <div className="rounded-lg border bg-card p-4 text-card-foreground">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {t("labels.ohConcentration")}
                  </p>
                  <p className="text-lg font-semibold font-mono">
                    {result.ohConcentration.toExponential(3)}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">M</span>
                  </p>
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
